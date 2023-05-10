import React from 'react'

const cardStatsShop = (item, numberOfMedalsForTournament, width, mainTextColor) => {

    //console.log(item);

    const widthBody = width || '90%'

    let atkBase = item.attack.int || item.attack
    if (!atkBase || atkBase.int === 0) {
        atkBase = 0
    }

    let dmgBase = item.damage.int || item.damage
    if (!dmgBase || dmgBase.int === 0) {
        dmgBase = 0
    }

    let speedBase = item.speed.int || item.speed
    if (!speedBase || speedBase.int === 0) {
        speedBase = 0
    }


    return (
        <div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>

                <div style={{ alignItems: 'center' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        HP
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })}>
                        {item.hp.int || item.hp}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Defense
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })}>
                        {item.defense.int || item.defense}
                    </p>
                </div>

            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>

                <div style={{ alignItems: 'center' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Atk
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })}>
                        {atkBase}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Damage
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })}>
                        {dmgBase}
                    </p>
                </div>
            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <div style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Speed
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })}>
                        {speedBase}
                    </p>
                </div>
            </div>

            {
                numberOfMedalsForTournament !== undefined &&
                <div style={{ width: widthBody, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Medals
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })}>
                        {numberOfMedalsForTournament}
                    </p>
                </div>
            }
        </div>
    )
}

const styles = {
    statsTitleStyle: {
        fontSize: 14,
        marginRight: 8
    },
    statsStyle: {
        fontSize: 16,
    },
}

export default cardStatsShop
