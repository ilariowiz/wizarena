import React from 'react'
import allSpells from './Spells'

const cardStats = (item, numberOfMedalsForTournament, width, fromFight) => {

    //console.log(item);

    let spellSelected = allSpells.find(i => i.name === item.spellSelected.name)

    //console.log(spellSelected);

    const widthBody = width || '90%'

    let atkSpell = spellSelected.atkBase
    if (!atkSpell || atkSpell === 0) {
        atkSpell = 0
    }

    ///console.log(atkSpell);

    let atkBase = item.attack.int || item.attack
    if (!atkBase || atkBase.int === 0) {
        atkBase = 0
    }

    let dmgSpell = spellSelected.dmgBase
    if (!dmgSpell || dmgSpell.int === 0) {
        dmgSpell = 0
    }

    //console.log(dmgSpell);

    let dmgBase = item.damage.int || item.damage
    if (!dmgBase || dmgBase.int === 0) {
        dmgBase = 0
    }

    //console.log(dmgBase);

    let hpBase = item.hp.int || item.hp
    let defBase = item.defense.int || item.defense

    let speedBase = item.speed ? item.speed.int : 0
    if (!speedBase || speedBase.int === 0) {
        speedBase = 0
    }

    let atkTotal = atkSpell + atkBase
    let dmgTotal = dmgSpell + dmgBase

    if (fromFight && item.potion && item.potion === "hp") {
        hpBase += 5
    }

    if (fromFight && item.potion && item.potion === "defense") {
        defBase += 2
    }

    if (fromFight && item.potion && item.potion === "attack") {
        atkTotal += 2
    }

    if (fromFight && item.potion && item.potion === "damage") {
        dmgTotal += 3
    }

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
                        {hpBase}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={styles.statsTitleStyle}>
                        DEFENSE
                    </p>
                    <p style={styles.statsStyle}>
                        {defBase}
                    </p>
                </div>

            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    SPELL
                </p>
                <p style={styles.statsStyle}>
                    {spellSelected.name.toUpperCase()}
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

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={styles.statsTitleStyle}>
                        SPEED
                    </p>
                    <p style={styles.statsStyle}>
                        {speedBase}
                    </p>
                </div>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={styles.statsTitleStyle}>
                    SPELL PERK
                </p>
                <p style={styles.statsStyle}>
                    {spellSelected.condition.name ? spellSelected.condition.name.toUpperCase() : '-'}
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

export default cardStats
