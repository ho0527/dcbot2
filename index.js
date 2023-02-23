import {Client,Events,GatewayIntentBits} from "discord.js"
import dotenv from "dotenv"
import fs from "fs"

const client=new Client({ intents:[GatewayIntentBits.Guilds] })
dotenv.config()

try{
    let channel = []
    client.on('message', async message => {
        let filedata = fs.readFileSync(`./guilds/${message.guild.id}.json`);
        let data = JSON.parse(filedata);
        const args = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);
        const command = args.shift().toLowerCase();
            switch (command) {
                case `help`:
                    if(message.guild.channels.cache.first().parentID == data.parentID){
                        let embed = new Discord.MessageEmbed()
                        embed.setColor("BLUE")
                        embed.setAuthor("動態語音機器人",client.user.avatarURL())
                        embed.setDescription("使用 `dvc!help <指令>` 開啟該指令詳細內容")
                        embed.addFields(
                            { name: `主要指令`, value: `**dvc!help** - 顯示所有指令` },
                                  { name: '基礎指令', value: `**dvc!name** -更改動態語音頻道名稱\n**dvc!limit** - 更改動態語音頻道人數上限` },
                                  { name: '隱私設定', value: `**dvc!hide** - 隱藏語音頻道\n**dvc!unhide** - 顯示語音頻道\n**dvc!lock** - 將頻道上鎖，其他使用者無法加入 ( 除非收到邀請 )\n**dvc!unlock** - 將頻道解鎖，所有人都可以加入` },
                                  { name: `管理指令`, value: `**dvc!set** 設定機器人\n**dvc!kick** @標記對象 - 踢除指定使用者\n**dvc!ban** @標記對象 - 添加使用者的封禁\n**dvc!unban** @標記對象 - 解除使用者的封禁\n**dvc!transfer** @標記對象 - 轉移頻道所有權至他人 ( 僅擁有所有權者可使用 )\n**dvc!claim** - 當擁有頻道所有權的使用者離開頻道時，其他使用者可向系統發送隨機挑選下個擁有者的要求` },
                        )
                        let confirm = await message.channel.send(embed)
                    }
                    break
                case `claim`:
                    if(message.guild.member(channel[message.guild.member(message.author.id).voice.channelID]).voice.channelID != message.guild.member(message.author.id).voice.channelID){
                        let old =channel[message.guild.member(message.author.id).voice.channelID]
                        channel[message.guild.member(message.author.id).voice.channelID] = message.author.id
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(old,{MANAGE_CHANNELS:false})
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(message.author.id,{MANAGE_CHANNELS:true})
                        await message.reply("轉移成功")
                    }else {
                        await message.reply("人家還在你就要奪權喔!?")
                    }
                    break
                case `transfer`:
                    if(channel[message.guild.member(message.author.id).voice.channelID] == message.author.id || args[0] != undefined){
                        const user = await getUserFromMention(args[0]);
                        if (!user) {
                            await message.reply('只能指定一個用戶');
                        }
                        let old =channel[message.guild.member(message.author.id).voice.channelID]
                        channel[message.guild.member(message.author.id).voice.channelID] = message.mentions.members.first().id
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(old,{MANAGE_CHANNELS:false})
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(user.id,{MANAGE_CHANNELS:true})
                        await message.reply("轉移成功")
                    }else {
                        await message.reply("必須要在你的語音頻道裡 或者 標註錯誤")
                    }
                    break
                case `lock`:
                    let lockpre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(lockpre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID ){
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(message.guild.roles.everyone,{CONNECT:false})
                        await message.reply(`成功鎖定頻道`)
                    }else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                    break
                case `unlock`:
                    let unlockpre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(unlockpre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID ){
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(message.guild.roles.everyone,{CONNECT:true})
                        await message.reply(`成功解鎖頻道`)
                    }else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                    break
                case `hide`:
                    let hidepre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(hidepre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID){
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(message.guild.roles.everyone,{VIEW_CHANNEL:false})
                        await message.reply(`成功隱藏頻道`)
                    }else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                    break
                case `unhide`:
                    let unhidepre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(unhidepre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID){
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(message.guild.roles.everyone,{VIEW_CHANNEL:true})
                        await message.reply(`成功解除隱藏頻道`)
                    }else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                    break
                case `limit`:
                    let pre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(pre && await checkstate(message) && args[0] != undefined){
                            const num = args[0];
                            if(num <= 99 && num >= 0){
                                await message.guild.member(message.author.id).voice.channel.edit({"userLimit":num})
                            }else {
                                await message.reply("無效數值")
                            }
                            return
                    }else {
                            if(await checkstate(message) == false){
                                await message.reply("你沒有在任何頻道裡,指令是無效的喔")
                            }else {
                                if(pre == false){
                                    await message.reply(`你沒有這個頻道的權限`)
                                }else {
                                    if(args[0] == undefined){
                                        await message.reply("無效數值")
                                    }
                                }
                            }
                    }
                    break
                case "ban":
                    const banuser = await getUserFromMention(args[0]);
                    if (!banuser) {
                        await message.reply('只能指定一個用戶');
                    }
                    let banpre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(banpre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID ){
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(banuser.id,{CONNECT:false})
                        await message.reply(`成功禁止 <@${banuser.id}> 加入語音頻道`)
                    }else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                    break
                case "unban":
                    const unbanuser = await getUserFromMention(args[0]);
                    if (!unbanuser) {
                        await message.reply('只能指定一個用戶');
                    }
                    let unbanpre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(unbanpre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID ){
                        await message.guild.member(message.author.id).voice.channel.updateOverwrite(unbanuser.id,{CONNECT:true})
                        await message.reply(`成功解除禁止 <@${unbanuser.id}> 加入語音頻道`)
                    }else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                    break
                case "name":
                    let namepre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                    if(namepre && args[0] != undefined && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID) {
                        await message.guild.member(message.author.id).voice.channel.edit({"name": args.join(' ')})
                    }else {
                        if (!namepre){
                            await message.reply(`你沒有這個頻道的權限`)
                        }else {
                            await message.reply(`無效數值`)
                        }
                    }
                    break
                case "kick":
                    const kickuser = await getUserFromMention(args[0]);
                    if (!kickuser) {
                        await message.reply('只能指定一個用戶');
                    }
                    let kickpre = message.member.guild.me.hasPermission("MANAGE_CHANNELS")
                try{
                    if (kickpre && channel[message.guild.member(message.author.id).voice.channelID] == message.author.id && message.guild.member(message.author.id).voice.channelID == message.guild.member(message.author.id).voice.channelID) {
                        if(message.guild.member(kickuser.id).voice.channelID == message.guild.member(message.author.id).voice.channelID){
                            await message.guild.member(kickuser.id).voice.setChannel(null)
                            await message.reply(`成功從語音頻道剔除 <@${kickuser.id}>`)
                        }else {
                            await message.reply(`該使用者不在你的頻道裡`)
                        }
                    } else {
                        await message.reply(`你沒有這個頻道的權限 或者 你不在任何頻道裡`)
                    }
                }catch (e) {
                    message.reply("該使用者不在任何頻道裡")
                }
                    break
                case "set":
                if (message.member.hasPermission("ADMINISTRATOR")){
                    let parentid = "";
                    let channel = "";
                    await message.delete();
                    await message.reply("請指定一個類別，用於創建頻道的父類別(請輸入類別ID，並於30秒內輸入完畢)")
                    message.channel.awaitMessages((values) => {return values.member.user.id === message.member.user.id },{ max: 1, time: 30000, errors: ['time'] }).then((e)=>{
                        parentid = e.first().content
                        message.channel.send(parentid)
                        message.reply("請指定一個語音頻道，用於創建頻道時進入使用(請輸入語音頻道ID，並於30秒內輸入完畢)")
                        message.channel.awaitMessages((values) => {return values.member.user.id === message.member.user.id },{ max: 1, time: 30000, errors: ['time'] }).then((b)=>{
                            channel = b.first().content
                            message.channel.send(channel)
                            let dt = {
                                parentid: parentid,
                                channel: channel
                            };
                            fs.writeFileSync(`${process.cwd()}/guilds/${message.guild.id}.json`, JSON.stringify(dt));
                            message.reply("設定成功")
                        }).catch(function (e) {
                            message.reply("已結束設定，設定失敗")
                        })
                    }).catch(function (e) {
                        message.reply("已結束設定，設定失敗")
                    })
                }else {
                    await message.reply(`你沒有權限使用此指令`);
                }
                    break
            }
    });
    client.on('voiceStateUpdate',  async function (old,voice) {
        try{
        let filedata = fs.readFileSync(`./guilds/${old.guild.id}.json`);
        let data = JSON.parse(filedata);
        let oldVoice = old.channelID;
        let newVoice = voice.channelID;
        if(newVoice == data.channel){
                let name = `${voice.member.user.username}`
                let newvoicechannel = voice.guild.channels.create(`${name} 的頻道`, {
                    type: 'voice',
                    parent: data.parentid,
                    permissionOverwrites: [
                        {
                            id: voice.member.user.id,
                            allow: ['MANAGE_CHANNELS'],
                        }
                    ]},)
                    .then(result => {
                        channel[result.id] = voice.member.user.id
                        voice.member.voice.setChannel(result.id)
                    })
        }
            if(old.channelID !=null){
                try {
                    if (old.channel.members.size == 0 && channel[old.channelID] == old.member.user.id) {
                        await old.channel.delete()
                        return
                    } else if (old.channel.members.size == 0 && old.channel.parentID == data.parentid) {
                        await old.channel.delete()
                        return
                    }
                } catch (e) {
                    return
                }
            }else if(oldVoice != null && newVoice !=null){
                try {
                    if (old.channel.members.size == 0 && channel[old.channelID] == old.member.user.id) {
                        await old.channel.delete()
                        return
                    } else if (old.channel.members.size == 0 && old.channel.parentID == data.parentid) {
                        await old.channel.delete()
                        return
                    }
                } catch (e) {
                    return
                }
            }}catch(e){
                return
            }
    });

    async function getUserFromMention(mention) {
        const matches = mention.match(/^<@!?(\d+)>$/);
        if (!matches) return;
        const id = matches[1];
        return client.users.cache.get(id);
    }

    async function checkstate(message) {
        if(message.guild.member(message.author.id).voice.channelID == null){
            return false
        }else {
            return true
        }
    }
}
catch(error){
    console.error(error.stack)
    const stackLines=error.stack.split('\n')
    const line=stackLines[1].trim().substring(3)
    console.log("there has an "+error+" in "+line)
}
client.once(Events.ClientReady,function(e){
	console.log(`Ready! Logged in as ${e.user.tag}`);
    //? client.user.setActivity(" 輸入main!help來獲得使用方式",{type:"WATCHING"})
})

client.login(process.env.TOKEN_HIHI)