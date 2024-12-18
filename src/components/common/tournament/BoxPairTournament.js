import React from 'react'
import getImageUrl from '../GetImageUrl'

const boxPairTournament = (item, index, userMinted, mainTextColor, subscribed, history, isDarkmode, rankings) => {

    let is1mine = false
    let is2mine = false
    let borderColor = '#d7d7d7'

    for (let i = 0; i < userMinted.length; i++) {
        const s = userMinted[i]

        if (s.id === item.s1.id) {
            is1mine = true
            borderColor = isDarkmode ? 'gold' : '#840fb2'
        }

        if (item.s2 && item.s2.id && s.id === item.s2.id) {
            is2mine = true
            borderColor = isDarkmode ? 'gold' : '#840fb2'
        }
    }

    const widthImage = 120

    let name1 = `#${item.s1.id}`
    let name2 = `#${item.s2.id}`

    if (subscribed) {
        const wiz1 = subscribed.find(i => i.id === item.s1.id)
        if (wiz1 && wiz1.nickname) {
            name1 = `${name1} ${wiz1.nickname}`
        }

        const wiz2 = subscribed.find(i => i.id === item.s2.id)
        if (wiz2 && wiz2.nickname) {
            name2 = `${name2} ${wiz2.nickname}`
        }
    }

    let score1;
    let score2;
    if (rankings && rankings.length > 0) {
        let rankingItem1 = rankings.find(i => i.id === item.s1.id)
        if (!rankingItem1) {
            score1 = 500
        }
        else {
            score1 = rankingItem1.ranking
        }

        let rankingItem2 = rankings.find(i => i.id === item.s2.id)
        if (!rankingItem2) {
            score2 = 500
        }
        else {
            score2 = rankingItem2.ranking
        }
    }

    return (
        <div
            style={Object.assign({}, styles.boxPair, { borderColor } )}
            key={index}
        >
            <div style={{ flexDirection: 'column', alignItems: 'center', marginRight: 5 }}>
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${item.s1.id}`}
                    onClick={(e) => {
                        e.preventDefault()
                        history.push(`/nft/${item.s1.id}`)
                    }}
                    style={{ position: 'relative' }}
                >
                    <img
                        style={{ width: widthImage, height: widthImage, borderRadius: 4, borderWidth: 1, borderColor: is1mine ? '#840fb2' : 'white', borderStyle: 'solid', marginBottom: 4 }}
                        src={getImageUrl(item.s1.id)}
                        alt={`#${item.s1.id}`}
                    />

                    {
                        score1 &&
                        <div style={{ position: 'absolute', right: 0, bottom: 8, backgroundColor: 'white', height: 15, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 4, borderBottomRightRadius: 4, paddingLeft: 5, paddingRight: 5 }}>
                            <p style={{ fontSize: 13, color: 'black' }}>
                                elo {score1}
                            </p>
                        </div>
                    }

                </a>

                <p style={{ fontSize: name1.length > 5 ? 13 : 16, color: mainTextColor, maxWidth: 110, textAlign: 'center' }} className="text-medium">
                    {name1}
                </p>

            </div>

            <div style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ fontSize: 14, color: mainTextColor, marginRight: 5 }}>
                    VS
                </p>
            </div>

            {
                item.s2 && item.s2.id ?
                <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.s2.id}`}
                        onClick={(e) => {
                            e.preventDefault()
                            history.push(`/nft/${item.s2.id}`)
                        }}
                        style={{ position: 'relative' }}
                    >
                        <img
                            style={{ width: widthImage, height: widthImage, borderRadius: 4, borderWidth: 1, borderColor: is2mine ? '#840fb2' : 'white', borderStyle: 'solid', marginBottom: 4 }}
                            src={getImageUrl(item.s2.id)}
                            alt={`#${item.s2.id}`}
                        />

                        {
                            score2 &&
                            <div style={{ position: 'absolute', left: 0, bottom: 8, backgroundColor: 'white', height: 15, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 4, borderBottomLeftRadius: 4, paddingLeft: 5, paddingRight: 5 }}>
                                <p style={{ fontSize: 13, color: 'black' }}>
                                    elo {score2}
                                </p>
                            </div>
                        }
                    </a>

                    <p style={{ fontSize: name2.length > 5 ? 13 : 16, color: mainTextColor, maxWidth: 110, textAlign: 'center' }} className="text-medium">
                        {name2}
                    </p>

                </div>
                :
                <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ width: widthImage, height: widthImage, marginBottom: 4 }}>
                    </div>

                    <p style={{ fontSize: 14, color: mainTextColor }}>
                        Opponent disappeared
                    </p>
                </div>
            }
        </div>
    )
}

const styles = {
    boxPair: {
        alignItems: 'flex-start',
        padding: 7,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
        marginRight: 15,
        marginBottom: 15
    }
}

export default boxPairTournament
