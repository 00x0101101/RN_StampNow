import { declareIndexPlugin, ReactRNPlugin, RichTextInterface, SetRemType } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import moment from 'moment';

async function onActivate(plugin: ReactRNPlugin) {


  await plugin.app.registerCommand({
    id: 'stamp_Now',
    name: 'StampNow',
    quickCode:"sn",
    action: async () => {
      let stamp=await createStamp(new Date());
      let thisRem=await plugin.focus.getFocusedRem();
      if(stamp&&thisRem)
      {
        let stampElement=(await plugin.richText.rem(stamp).value());
        let thisText=thisRem.text.concat(stampElement);
        thisRem?.setText(thisText);
      }
    },
  });





  const createStamp=async (date:Date|undefined)=>{
    date=date||new Date();
    let mo=moment(date);

    let stampText=`${mo.format("HH:mm")}`
    let stampRichText=await plugin.richText.text(stampText).value()

    let daily=await plugin.date.getDailyDoc(date);
    if(!(daily))
    {
      await plugin.app.toast("Failed to Locate Dairy");
      return;
    }
    let stamp= (await plugin.rem.findByName(stampRichText,daily._id))||(await plugin.rem.createRem())
    stamp?.setType(SetRemType.DESCRIPTOR)
    if(!stamp)
    {
      await plugin.app.toast("Failed to Create Stamp");
      return;
    }

    await stamp.setParent(daily);
    await stamp.setText(stampRichText);
    return stamp
  }

  //todo: a function to add timestamp for the past or the future.
  const RichText2Date=(rText:RichTextInterface)=>{
    let date=new Date();

  }

}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
