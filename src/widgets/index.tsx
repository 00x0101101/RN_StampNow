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


// origin definition is in "consts.tsx" under the project:
// [GTD_On_RN](https://github.com/00x0101101/GTD_On_RN)
const TICK_PW = 'time_tick';
const TICK_SLOT = 'tkty';


async function onActivate(plugin: ReactRNPlugin) {
	const getAllPropOf = async (tagRem: Rem | undefined) => {
		let children = await tagRem?.getChildrenRem();
		return children && await filterAsync(children, c => c.isProperty());
	};

	await plugin.app.registerCommand({
		id: 'stamp_Now',
		name: 'StampNow',
		quickCode: 'sn',
		action: async () => {
			let stamp = await createStamp(new Date());
			let thisRem = await plugin.focus.getFocusedRem();
			if (stamp && thisRem) {
				// await stamp.copyReferenceToClipboard();
				// await plugin.app.toast('Stamp Copied!');
				let stampElement = (await plugin.richText.rem(stamp).value());
				let thisText = thisRem.text?.concat(stampElement);
				if (thisText)
					thisRem?.setText(thisText);
			}
		},

	});


	const createStamp = async (date: Date | undefined) => {
		date = date || new Date();
		let mo = moment(date);

		let stampText = `${mo.format('HH:mm')}`;
		let stampRichText = await plugin.richText.text(stampText).value();

		let daily = await plugin.date.getDailyDoc(date);
		if (!(daily)) {
			await plugin.app.toast('Failed to Locate Dairy');
			return;
		}
		let stamp = (await plugin.rem.findByName(stampRichText, daily._id)) || (await plugin.rem.createRem());
		stamp?.setType(SetRemType.DESCRIPTOR);
		if (!stamp) {
			await plugin.app.toast('Failed to Create Stamp');
			return;
		}

		await stamp.setParent(daily);
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
