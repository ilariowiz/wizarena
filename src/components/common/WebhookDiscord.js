export const sendMessage = (id, amount, expiration, owner) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `${owner.slice(0, 5)}... wallet has received an offer for Wizard #${id} of ${amount} KDA which expires in ${expiration} days`

    const params = {
        username: `${owner.slice(0, 15)}...`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageSales = (id, amount) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_SALES)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} just sold for ${amount} KDA`

    const params = {
        username: `#${id}`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageListed = (id, amount) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_LISTED)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} just listed for ${amount} KDA`

    const params = {
        username: `#${id}`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageDelisted = (id) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_URL_LISTED)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} just delisted`

    const params = {
        username: `#${id}`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageUpdateNickname = (id, nickname) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_UPDATE_NICKNAME)
    request.setRequestHeader("Content-type", 'application/json')


    const content = `#${id} changed name to ${nickname}`

    const params = {
        username: `#${id}`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        content
    }

    request.send(JSON.stringify(params));
}

export const sendMessageUpgrade = (id, name, stat, increase) => {
    const request = new XMLHttpRequest()

    request.open("POST", process.env.REACT_APP_DISCORD_WEBHOOK_UPGRADES)
    request.setRequestHeader("Content-type", 'application/json')

    const content = `${name} upgrade ${stat.toUpperCase()} by ${increase}`

    //console.log(content);

    const params = {
        username: `#${id}`,
        avatar_url: `https://storage.googleapis.com/wizarena/generated_imgs/${id}.png`,
        content
    }

    request.send(JSON.stringify(params));
}
