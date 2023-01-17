import React from 'react'

const cardStatsShop = (item, numberOfMedalsForTournament, width) => {

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
                <div>
                    <p style={styles.statsTitleStyle}>
                        HP
                    </p>
                    <p style={styles.statsStyle}>
                        {item.hp.int || item.hp}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={styles.statsTitleStyle}>
                        DEFENSE
                    </p>
                    <p style={styles.statsStyle}>
                        {item.defense.int || item.defense}
                    </p>
                </div>

            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>

                <div style={{ marginBottom: 7 }}>
                    <p style={styles.statsTitleStyle}>
                        ATK
                    </p>
                    <p style={styles.statsStyle}>
                        {atkBase}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap', marginBottom: 7 }}>
                    <p style={styles.statsTitleStyle}>
                        DAMAGE
                    </p>
                    <p style={styles.statsStyle}>
                        {dmgBase}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={styles.statsTitleStyle}>
                        SPEED
                    </p>
                    <p style={styles.statsStyle}>
                        {speedBase}
                    </p>
                </div>
            </div>

            {
                numberOfMedalsForTournament !== undefined &&
                <div style={{ width: widthBody, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <p style={styles.statsTitleStyle}>
                        MEDALS
                    </p>
                    <p style={styles.statsStyle}>
                        {numberOfMedalsForTournament}
                    </p>
                </div>
            }
        </div>
    )
}

const styles = {
    statsTitleStyle: {
        fontSize: 16,
        color: '#c2c0c0',
        marginRight: 8
    },
    statsStyle: {
        fontSize: 16,
        color: 'white'
    },
}

export default cardStatsShop
