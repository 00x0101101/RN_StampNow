import {
	declareIndexPlugin,
	filterAsync,
	ReactRNPlugin,
	Rem,
	RichTextInterface,
	SetRemType,
} from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import moment from 'moment';

//todo:
// 1.adapt some operations according the platform OS
//      some api like "insertRichText" may not work perperly in current version of plugin api
// 2.turn stamp/ref to stamp to a property or a source reference( partially done)



//region const definitions
// external const value:origin definition is in "consts.tsx" under the project: [GTD_On_RN](https://github.com/00x0101101/GTD_On_RN)
const TICK_PW = 'time_tick';
const TICK_SLOT = 'tkty';
//endregion

async function onActivate(plugin: ReactRNPlugin) {
	const getAllPropOf = async (tagRem: Rem | undefined) => {
		let children = await tagRem?.getChildrenRem();
		return children && await filterAsync(children, c => c.isProperty());
	};


	await plugin.settings.registerDropdownSetting({
		defaultValue: 'src', id: 'stamp_form', title: 'time stamps as',description:"the timestamps will be stamped onto the rem as...",
		options:[{
			key:"0",
			value:"src",
			label:"a source added"
		}, {
			key:"1",
			value:"ref",
			label:"a referencing to the stamp"
		},{
			key:"2",
			value:"tag",
			label: "as a tag onto the rem"
		}]
	})

	await plugin.app.registerCommand({
		id: 'stamp_Now',
		name: 'StampNow',
		quickCode: 'sn',
		action: async () => {
			let stamp = await createStamp(new Date());
			let thisRem = await plugin.focus.getFocusedRem();
			if (stamp && thisRem && stamp._id!==thisRem._id) {

				const form = await plugin.settings.getSetting('stamp_form')
				if("ref"===form){
					let stampElement = (await plugin.richText.rem(stamp).value());
					await plugin.editor.insertRichText(stampElement);
				}
				// await stamp.copyReferenceToClipboard();
				// await plugin.app.toast('Stamp Copied!');
				if("src"===form){
					// let stampElement = (await plugin.richText.rem(stamp).value());
					await thisRem.addSource(stamp)
				}
				if("tag"===form){
					await thisRem.addTag(stamp)
				}
			}
		},

	});


	const createStamp = async (date: Date | undefined) => {
		date = date || new Date();
		let mo = moment(date);

		let stampText = `${mo.format('HH:mm')}`;
		let stampRichText = await plugin.richText.text(stampText).value();

		let daily = await plugin.date.getDailyDoc(date);
		let focus=await plugin.focus.getFocusedRem();
		if (!(daily)) {
			await plugin.app.toast('Failed to Locate Dairy');
			return;
		}
		let stamp:Rem|undefined;
		//whether a reference to stamp is not to create
		let refNeedless=false;
		//if focused rem is blank and one child of today's dailyDoc, the reference need not create.
		if(focus&&focus.parent===daily._id&&!focus.text?.length)
		{
			stamp=focus;
			refNeedless=true;
		}
		else
			stamp = (await plugin.rem.findByName(stampRichText, daily._id)) || (await plugin.rem.createRem());
		stamp?.setType(SetRemType.DESCRIPTOR);
		if (!stamp) {
			await plugin.app.toast('Failed to Create Stamp');
			return;
		}

		if(!refNeedless)await stamp.setParent(daily);
		await stamp.setText(stampRichText);

		//add corresponding tags for the stamp if the plugin "GTD_On_RN" (aka. "GTD workflow enhancement") has been installed
		try
		{
			const tickPW = await plugin.powerup.getPowerupByCode(TICK_PW);
			if (tickPW) {
				await stamp.addPowerup(TICK_PW)
			}
		}
		catch (e) {
			return stamp;
		}
		return stamp;
	};

	//todo: a function to add timestamp for the past or the future.
	const RichText2Date = (rText: RichTextInterface) => {
		let date = new Date();
	};


}

async function onDeactivate(_: ReactRNPlugin) {
}

declareIndexPlugin(onActivate, onDeactivate);
