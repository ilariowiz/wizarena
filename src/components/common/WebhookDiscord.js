const sendMessage = (id, amount, expiration, owner) => {
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

export default sendMessage
