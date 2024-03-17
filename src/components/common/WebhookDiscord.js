import itemToUrl from './ItemToUrl'

export const sendMessage = (id, amount, expiration, owner) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `${owner} wallet has received an offer for Wizard #${id} of **${amount}** KDA which expires in **${expiration}** days`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        //content
        embeds: [
            {
                "title": `#${id}`,
                "description": content,
                "url": `https://www.wizardsarena.net/nft/${id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageDeclineOffer = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `The offer for #${info.id} of ${info.amount} KDA has been declined`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${info.id}.png`,
        //content
        embeds: [
            {
                "title": `#${info.id}`,
                "description": content,
                "url": `https://www.wizardsarena.net/nft/${info.id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${info.id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageOfferItem = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `There is a new offer for the ${info.ringType}: **${info.amount}** WIZA, expires in **${info.duration}** days`

    const params = {
        username: info.ringType,
        avatar_url: itemToUrl[info.ringType],
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageCollectionOffer = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `There is a new offer for a Wizard NFT: **${info.amount}** $KDA, expires in **${info.duration}** days`

    const params = {
        username: "Wizard",
        avatar_url: "https://storage.googleapis.com/wizarena/placeholder.png",
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageSales = (id, amount) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_SALES)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} just sold for **${amount}** KDA`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        //content
        embeds: [
            {
                "title": `#${id}`,
                "description": content,
                "url": `https://www.wizardsarena.net/nft/${id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageSalesEquipment = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_SALES)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${info.id} ${info.name} just sold for **${info.amount}** WIZA`

    const params = {
        username: `Wizard Bot`,
        avatar_url: info.url,
        //content
        embeds: [
            {
                "title": `${info.name}`,
                "description": content,
                "url": `https://www.wizardsarena.net/item/${info.id}`,
                "thumbnail": {
                    "url": info.url
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageListed = (id, amount) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_LISTED)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} just listed for **${amount}** KDA`

    const params = {
        username: 'Wizard Bot',
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        //content,
        embeds: [
            {
                "title": `#${id}`,
                "description": content,
                "url": `https://www.wizardsarena.net/nft/${id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageListedEquipment = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_LISTED)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${info.id} ${info.name} just listed for **${info.amount}** WIZA`

    const params = {
        username: `Wizard Bot`,
        avatar_url: info.url,
        //content
        embeds: [
            {
                "title": `${info.name}`,
                "description": content,
                "url": `https://www.wizardsarena.net/item/${info.id}`,
                "thumbnail": {
                    "url": info.url
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageDelisted = (id) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_LISTED)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} just delisted`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        //content
        embeds: [
            {
                "title": `#${id}`,
                "description": content,
                "url": `https://www.wizardsarena.net/nft/${id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageDelistedEquipment = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_LISTED)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${info.id} ${info.name} just delisted`

    const params = {
        username: 'Wizard Bot',
        avatar_url: info.url,
        //content
        embeds: [
            {
                "title": `${info.name}`,
                "description": content,
                "url": `https://www.wizardsarena.net/item/${info.id}`,
                "thumbnail": {
                    "url": info.url
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageUpdateNickname = (id, nickname) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_UPDATE_NICKNAME)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} changed name to **${nickname}**`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        //content
        embeds: [
            {
                "title": `#${id}`,
                "description": content,
                "url": `https://www.wizardsarena.net/nft/${id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageUpgrade = (id, message) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_UPGRADES)
    request.setRequestHeader("Content-type", 'application/json')
    //console.log(content);

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        //content: message
        embeds: [
            {
                "title": `#${id}`,
                "description": message,
                "url": `https://www.wizardsarena.net/nft/${id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageChallenge = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_CHALLENGE)
    request.setRequestHeader("Content-type", 'application/json')
    //console.log(content);

    const message = `There is a new challenge for **#${info.wiz2id}**: he was challenged by **#${info.wiz1id}** for **${info.amount}** $${info.coin.toUpperCase()}`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${info.wiz2id}.png`,
        //content: message
        embeds: [
            {
                "title": `#${info.wiz2id}`,
                "description": message,
                "url": `https://www.wizardsarena.net/nft/${info.wiz2id}`,
                "thumbnail": {
                    "url": `https://storage.googleapis.com/wizarena/generated_imgs/${info.wiz2id}.png`
                }
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageFlashT = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_FLASHT)
    request.setRequestHeader("Content-type", 'application/json')
    //console.log(content);

    const winners = info.winners === 1 ? "Winner takes all" : "70% 1st, 30% 2nd"

    const message = `There is a new Flash tournament! Buyin **${info.buyin}** WIZA, Max level **${info.maxLevel}**, Players: **${info.nPlayers}**, Prizes: ${winners}, Type: ${info.type}. *(it will be visible in about 30 seconds)*`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/wiz_logo_centrale.png`,
        //content: message
        embeds: [
            {
                "title": `${info.name || "Flash Tournament"}`,
                "description": message,
                "url": `https://www.wizardsarena.net/flashtournaments`,
                "color": 16776960
            }
        ]
    }

    request.send(JSON.stringify(params));
}

export const sendMessageFlashTSub = (info) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_FLASHT)
    request.setRequestHeader("Content-type", 'application/json')
    //console.log(content);

    let name = info.name ? `Flash tournament **${info.name}**, ID **${info.id}**` : `Flash tournament **${info.id}**`
    let message = `A wizard join ${name}! Buyin **${info.buyin}** WIZA, Max level **${info.maxLevel.int}**.`

    if (info.players.length === (info.nPlayers.int - 1)) {
        message = `${message} *The tournament will start in a few minutes.*`
    }
    else {
        const pLeft = info.nPlayers.int - 1 - info.players.length
        message = `${message} *${pLeft} wizards left to start the tournament.*`
    }

    let title = info.name ? `Flash Tournament ${info.name}` : `Flash Tournament ${info.id}`

    const params = {
        username: `Wizard Bot`,
        avatar_url: `https://storage.googleapis.com/wizarena/wiz_logo_centrale.png`,
        //content: message
        embeds: [
            {
                "title": title,
                "description": message,
                "url": `https://www.wizardsarena.net/flashtournaments`,
                "color": 255
            }
        ]
    }

    request.send(JSON.stringify(params));
}
