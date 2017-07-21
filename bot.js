const TelegramBot = require('node-telegram-bot-api');

var config = require('./config.js')
console.log(config)
const request = require('request')
const bot = new TelegramBot(config['telegram_token'], {polling: true});

bot.onText(/\/start/, (msg)=>{
    bot.sendMessage(msg.chat.id,'Bem-vindo '+msg.from.first_name)
});

bot.onText(/\/name (.+)/i,(msg,match)=>{
    var name = match[1]
    var summon_name = encodeURI(name)
    
    //realizar request ao endpoint api do LoL a partir do [nome] 
    request('https://br1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+summon_name+'?api_key='+config['LoL_token'], (error,response,body) =>{
        if(response.statusCode == 200){

            //pegar summonerID
            summoner_infos = JSON.parse(body)
            user_id = summoner_infos['id']

            //realizar request ao endpoint api do LoL a partir do [summonerID]
            request('https://br1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+user_id+'?api_key='+config['LoL_token'],(erros,response,body) =>{
                if(response.statusCode == 200){
                    rank_info = JSON.parse(body)
                    tier_and_rank = []

                    /*
                     Capturar dados para objeto e 
                     pusha-los para array
                    */ 
                    for(var i in rank_info){
                        tier_and_rank.push(
                            {
                                'Queue' : rank_info[i]['queueType'],
                                'Tier' : rank_info[i]['tier'],
                                'Rank' : rank_info[i]['rank']
                            })
                    }
                    
                    
                    if(tier_and_rank.length == 0 ){
                        bot.sendMessage(msg.chat.id, 'Jogador <b>'+name+'</b> não possui rank.',{parse_mode : "HTML"})
                    }else{

                        //Atribuir dados {qeue,tier,rank} à mensagem 
                        var bot_msg_response = ""
                        for( var i in tier_and_rank){
                            var _msg = `
    Queue : ${tier_and_rank[i]["Queue"]}
    Tier : ${tier_and_rank[i]["Tier"]}
    Rank : ${tier_and_rank[i]["Rank"]}\n`
                            bot_msg_response+=_msg
                        }

                        bot.sendMessage(msg.chat.id, "<b>Jogador : "+name+"</b><code>"+bot_msg_response+"</code> <a href='http://ddragon.leagueoflegends.com/cdn/7.14.1/img/profileicon/"+summoner_infos['profileIconId']+".png'>&#160;</a>"  , {parse_mode : "HTML"});
                    }
                }
            });
        }else{
            bot.sendMessage(msg.chat.id, 'Summoner name não existe/encontrado')
        }
    });
});


bot.onText(/\/faker/,(msg)=>{
   bot.sendPhoto(msg.chat.id, 'lol_pics/faker.jpeg') 
});