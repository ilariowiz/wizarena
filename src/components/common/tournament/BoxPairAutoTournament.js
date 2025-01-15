import React from 'react'
import { MdPlayCircleOutline } from 'react-icons/md'
import getImageUrl from '../GetImageUrl'

const boxPairAutoTournament = (item, index, userMinted, mainTextColor, history, isDarkmode) => {

    let is1mine = false
    let is2mine = false
    let borderColor = '#d7d7d7'

    for (let i = 0; i < userMinted.length; i++) {
        const s = userMinted[i]

        if (s.id === item.s1) {
            is1mine = true
            borderColor = isDarkmode ? 'gold' : '#840fb2'
        }

        if (item.s2 && s.id === item.s2) {
            is2mine = true
            borderColor = isDarkmode ? 'gold' : '#840fb2'
        }
    }

    const widthImage = 90

    return (
        <div
            style={Object.assign({}, styles.boxPair, { borderColor } )}
            key={index}
        >
            <div style={{ flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ flexDirection: 'column', alignItems: 'center', marginRight: 5 }}>
                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.s1}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ position: 'relative' }}
                    >
                        <img
                            style={{ width: widthImage, height: widthImage, borderRadius: 4, borderWidth: 1, borderColor: is1mine ? '#840fb2' : 'white', borderStyle: 'solid', marginBottom: 4 }}
                            src={getImageUrl(item.s1)}
                            alt={`#${item.s1}`}
                        />
                    </a>

                    <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                        #{item.s1}
                    </p>

                </div>

                <div style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ fontSize: 16, color: mainTextColor, marginRight: 5 }}>
                        VS
                    </p>
                </div>

                {
                    item.s2 ?
                    <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                        <a
                            href={`${window.location.protocol}//${window.location.host}/nft/${item.s2}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ position: 'relative' }}
                        >
                            <img
                                style={{ width: widthImage, height: widthImage, borderRadius: 4, borderWidth: 1, borderColor: is2mine ? '#840fb2' : 'white', borderStyle: 'solid', marginBottom: 4 }}
                                src={getImageUrl(item.s2)}
                                alt={`#${item.s2}`}
                            />
                        </a>

                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                            #{item.s2}
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

            {   item.s2 &&
                <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <a
                        href={`${window.location.protocol}//${window.location.host}/fightreplay/fights/${item.fightId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer' }}
                    >
                        <MdPlayCircleOutline
                            size={21}
                            color={mainTextColor}
                        />
                    </a>
                </div>
            }
        </div>
    )
}

const styles = {
    boxPair: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 5,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
        marginRight: 10,
        marginBottom: 10
    }
}

export default boxPairAutoTournament
