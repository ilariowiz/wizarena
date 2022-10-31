import React from 'react'

const cardStats = (item, numberOfMedalsForTournament, width) => {

    //console.log(item);

    const widthBody = width || '90%'

    let atkSpell = item.spellSelected.atkBase.int || item.spellSelected.atkBase
    if (!atkSpell || atkSpell.int === 0) {
        atkSpell = 0
    }

    let atkBase = item.attack.int || item.attack
    if (!atkBase || atkBase.int === 0) {
        atkBase = 0
    }

    let dmgSpell = item.spellSelected.dmgBase.int || item.spellSelected.dmgBase
    if (!dmgSpell || dmgSpell.int === 0) {
        dmgSpell = 0
    }

    let dmgBase = item.damage.int || item.damage
    if (!dmgBase || dmgBase.int === 0) {
        dmgBase = 0
    }

    //console.log(dmgBase);

    let atkTotal = atkSpell + atkBase
    let dmgTotal = dmgSpell + dmgBase

    return (
        <div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    ELEMENT
                </p>
                <p style={styles.statsStyle}>
                    {item.element.toUpperCase()}
                </p>
            </div>

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

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    SPELL
                </p>
                <p style={styles.statsStyle}>
                    {item.spellSelected.name.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>

                <div>
                    <p style={styles.statsTitleStyle}>
                        ATK
                    </p>
                    <p style={styles.statsStyle}>
                        {atkTotal}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={styles.statsTitleStyle}>
                        DAMAGE
                    </p>
                    <p style={styles.statsStyle}>
                        {dmgTotal}
                    </p>
                </div>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    SPELL PERK
                </p>
                <p style={styles.statsStyle}>
                    {item.spellSelected.condition.name ? item.spellSelected.condition.name.toUpperCase() : '-'}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    RESISTANCE
                </p>
                <p style={styles.statsStyle}>
                    {item.resistance.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    WEAKNESS
                </p>
                <p style={styles.statsStyle}>
                    {item.weakness.toUpperCase()}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
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
        fontSize: 16,
        color: '#c2c0c0',
        marginRight: 8
    },
    statsStyle: {
        fontSize: 16,
        color: 'white'
    },
}

export default cardStats
