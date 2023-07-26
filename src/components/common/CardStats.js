import React from 'react'
import allSpells from './Spells'

const cardStats = (item, numberOfMedalsForTournament, width, bonusFromRing, mainTextColor) => {

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

    let speedBase = 0
    if (item.speed && (item.speed.int || item.speed.int === 0)) {
        speedBase = item.speed.int
    }
    else if (item.speed && !item.speed.int) {
        speedBase = item.speed
    }

    /*
    let speedBase = item.speed.int || item.speed
    if (!speedBase || speedBase.int === 0) {
        speedBase = 0
    }
    */

    let atkTotal = atkSpell + atkBase + item['upgrades-spell'].attack.int
    let dmgTotal = dmgSpell + dmgBase + item['upgrades-spell'].damage.int

    if (bonusFromRing) {
        //console.log(bonusFromRing);
        Object.keys(bonusFromRing).map(key => {
            //console.log(key);

            let bonus = bonusFromRing[key]

            if (key === "hp") {
                hpBase += bonus
            }
            else if (key === 'defense') {
                defBase += bonus
            }
            else if (key === 'attack') {
                atkTotal += bonus
            }
            else if (key === 'damage') {
                dmgTotal += bonus
            }
            else if (key === 'speed') {
                speedBase += bonus
            }
        })
    }

    return (
        <div style={{  width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                    Element
                </p>
                <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                    {item.element}
                </p>
            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <div>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        HP
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                        {hpBase}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Defense
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                        {defBase}
                    </p>
                </div>

            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                    Spell
                </p>
                <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                    {spellSelected.name}
                </p>
            </div>

            <div style={{ width: widthBody, justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>

                <div>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Atk
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                        {atkTotal}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Dmg
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                        {dmgTotal}
                    </p>
                </div>

                <div style={{ flexWrap: 'wrap' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Speed
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                        {speedBase}
                    </p>
                </div>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                    Spell perk
                </p>
                <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                    {spellSelected.condition.name ? spellSelected.condition.name : '-'}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                    Resistance
                </p>
                <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                    {item.resistance}
                </p>
            </div>

            <div style={{ width: widthBody, alignItems: 'center', marginBottom: 7, flexWrap: 'wrap' }}>
                <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                    Weakness
                </p>
                <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
                    {item.weakness}
                </p>
            </div>

            {
                numberOfMedalsForTournament !== undefined &&
                <div style={{ width: widthBody, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                    <p style={Object.assign({}, styles.statsTitleStyle, { color: mainTextColor })}>
                        Medals
                    </p>
                    <p style={Object.assign({}, styles.statsStyle, { color: mainTextColor })} className="text-medium">
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
        fontSize: 16
    },
}

export default cardStats
