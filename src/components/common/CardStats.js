import React from 'react'

const cardStats = (stats, numberOfMedalsForTournament) => {

    const widthBody = '90%'

    return (
        <div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7 }}>
                <p style={styles.statsTitleStyle}>
                    ELEMENT
                </p>
                <p style={styles.statsStyle}>
                    {stats.stats.elemento.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div>
                    <p style={styles.statsTitleStyle}>
                        HP
                    </p>
                    <p style={styles.statsStyle}>
                        {stats.stats.hp}
                    </p>
                </div>

                <div>
                    <p style={styles.statsTitleStyle}>
                        DEFENSE
                    </p>
                    <p style={styles.statsStyle}>
                        {stats.stats.difesa}
                    </p>
                </div>

            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7 }}>
                <p style={styles.statsTitleStyle}>
                    SPELL
                </p>
                <p style={styles.statsStyle}>
                    {stats.stats.spellSelected.name.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>

                <div>
                    <p style={styles.statsTitleStyle}>
                        ATK
                    </p>
                    <p style={styles.statsStyle}>
                        {stats.stats.attacco + stats.stats.spellSelected.atkBase}
                    </p>
                </div>

                <div>
                    <p style={styles.statsTitleStyle}>
                        DAMAGE
                    </p>
                    <p style={styles.statsStyle}>
                        {stats.stats.danno + stats.stats.spellSelected.dmgBase}
                    </p>
                </div>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7 }}>
                <p style={styles.statsTitleStyle}>
                    SPELL PERK
                </p>
                <p style={styles.statsStyle}>
                    {stats.stats.spellSelected.condition.name ? stats.stats.spellSelected.condition.name.toUpperCase() : '-'}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7 }}>
                <p style={styles.statsTitleStyle}>
                    RESISTANCE
                </p>
                <p style={styles.statsStyle}>
                    {stats.stats.resistenza.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7 }}>
                <p style={styles.statsTitleStyle}>
                    WEAKNESS
                </p>
                <p style={styles.statsStyle}>
                    {stats.stats.debolezza.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 12 }}>
                <p style={styles.statsTitleStyle}>
                    MEDALS
                </p>
                <p style={styles.statsStyle}>
                    {numberOfMedalsForTournament}
                </p>
            </div>
        </div>
    )
}

const styles = {
    statsTitleStyle: {
        fontSize: 15,
        color: '#c2c0c0',
        marginRight: 8
    },
    statsStyle: {
        fontSize: 15,
        color: 'white'
    },
}

export default cardStats
