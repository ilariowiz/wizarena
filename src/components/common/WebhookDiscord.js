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
