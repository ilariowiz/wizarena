import getPendantBonus from './GetPendantBonus'

let history = []
let isEnd = false
let winner = undefined
let evento = undefined
let isEventActive = false

const getStartingText = (player, hasRing, hasPendant, hasAura) => {

    if (!hasRing && !hasPendant && !hasAura) {
        return undefined
    }

    let desc = [`${player.name} have:`]

    if (hasRing) {
        desc.push(`a ${player.ring.name}`)
    }

    if (hasPendant) {
        desc.push(`a ${player.pendant.name}`)
    }

    if (hasAura) {
        desc.push(`a Defensive Aura +${player.aura.bonus.int}`)
    }

    return desc.join(' - ')
}

const fight = (s1, s2, ev, callback) => {
    let s1copy = Object.assign({}, s1)
    let s2copy = Object.assign({}, s2)

    s1copy['condizione'] = {}
    s2copy['condizione'] = {}

    let s1hasRing = false
    let s1hasPendant = false
    let s1hasAura = false

    if (s1copy.ring && s1copy.ring.equipped) {
        s1hasRing = true
    }

    if (s1copy.pendant && s1copy.pendant.equipped) {
        s1hasPendant = true

        const pendantBonus = getPendantBonus(s1copy.pendant)
        s1copy['pendantBonus'] = pendantBonus.bonusesDict
    }

    if (s1copy.aura && s1copy.aura.bonus) {
        s1hasAura = true
    }

    let desc1 = getStartingText(s1copy, s1hasRing, s1hasPendant, s1hasAura)

    if (desc1) {
        history.push({ desc: desc1, [`hp_${s1copy.id}`]: s1copy.hp, [`hp_${s2copy.id}`]: s2copy.hp })
    }

    /////// PLAYER 2
    let s2hasRing = false
    let s2hasPendant = false
    let s2hasAura = false

    if (s2copy.ring && s2copy.ring.equipped) {

        s2hasRing = true
    }

    if (s2copy.pendant && s2copy.pendant.equipped) {

        s2hasPendant = true

        const pendantBonus = getPendantBonus(s2copy.pendant)
        s2copy['pendantBonus'] = pendantBonus.bonusesDict
    }

    if (s2copy.aura && s2copy.aura.bonus) {
        s2hasAura = true
    }

    let desc2 = getStartingText(s2copy, s2hasRing, s2hasPendant, s2hasAura)

    if (desc2) {
        history.push({ desc: desc2, [`hp_${s1copy.id}`]: s1copy.hp, [`hp_${s2copy.id}`]: s2copy.hp })
    }

    //console.log(s1copy, s2copy);
    //return

    if (ev) {
        evento = Object.assign({}, ev)
    }

    let iniziativa1 = Math.floor(Math.random() * 13) + 1; //da 1 a 13
    iniziativa1 = iniziativa1 + s1copy.speed

    let iniziativa2 = Math.floor(Math.random() * 13) + 1; //da 1 a 13
    iniziativa2 = iniziativa2 + s2copy.speed

    //console.log(iniziativa1, iniziativa2);

    if (iniziativa1 > iniziativa2) {
        turno(s1copy, s2copy)
    }
    else if (iniziativa1 < iniziativa2) {
        turno(s2copy, s1copy)
    }
    //uguali, controlliamo chi ha la speed più alta
    else {
        if (s1copy.speed > s2copy.speed) {
            turno(s1copy, s2copy)
        }
        else if (s1copy.speed < s2copy.speed) {
            turno(s2copy, s1copy)
        }
        else {
            //se hanno anche le speed uguali allora random
            let iniziativaRnd = Math.floor(Math.random() * 10) + 1; //da 1 a 10
            if (iniziativaRnd <= 5) {
                turno(s1copy, s2copy)
            }
            else {
                turno(s2copy, s1copy)
            }

        }
    }

    //console.log(isEnd);
    if (callback && isEnd) {
        callback(history, winner)
        //reset state
        history = []
        isEnd = false
        winner = undefined
        evento = undefined
        isEventActive = false
    }
}

const convertConditionName = (name) => {
    //console.log(name);
    if (name.includes("Poison")) {
        return "is poisoned"
    }
    else if (name.includes("Burn")) {
        return "is burned"
    }
    else if (name.includes("Confuse")) {
        return "is confused"
    }
    else if (name.includes("Freeze")) {
        return "is frozen"
    }
    else if (name.includes("Slow")) {
        return "is slowed"
    }
    else if (name.includes("Paralyze")) {
        return "is paralyzed"
    }
    else if (name.includes("Shock")) {
        return "is shocked"
    }
    else if (name.includes("Blind")) {
        return "is blinded"
    }
    else if (name.includes("Exhaust")) {
        return "is exhausted"
    }
    else if (name.includes("Fear")) {
        return "is frightened"
    }
    else if (name.includes("Disease")) {
        return "is sickened"
    }
    else if (name.includes("Harden") || name.includes("Protection")) {
        return "is less effective"
    }
    else if (name.includes("Curse")) {
        return "is cursed"
    }
}

const convertConditionNamePositive = (name) => {
    if (name.includes("Poison")) {
        return "is no longer poisoned"
    }
    else if (name.includes("Burn")) {
        return "is no longer burned"
    }
    else if (name.includes("Confuse")) {
        return "is no longer confused"
    }
    else if (name.includes("Freeze")) {
        return "is no longer frozen"
    }
    else if (name.includes("Slow")) {
        return "is no longer slowed"
    }
    else if (name.includes("Paralyze")) {
        return "is no longer paralyzed"
    }
    else if (name.includes("Shock")) {
        return "is no longer shocked"
    }
    else if (name.includes("Blind")) {
        return "is no longer blinded"
    }
    else if (name.includes("Exhaust")) {
        return "is no longer exhausted"
    }
    else if (name.includes("Fear")) {
        return "is no longer frightened"
    }
    else if (name.includes("Disease")) {
        return "is no longer sickened"
    }
    else if (name.includes("Harden") || name.includes("Protection")) {
        return "is effective again"
    }
    else if (name.includes("Curse")) {
        return "is no longer cursed"
    }
}

const turno = (attaccante, difensore) => {

    //console.log(attaccante, difensore);

    //se l'evento non è attivo, vediamo se si attiva
    if (evento) {
        if (!isEventActive) {
            let checkTriggerEvent = Math.floor(Math.random() * 100) + 1; //da 1 a 100
            if (checkTriggerEvent > 50) {
                isEventActive = true
                history.push({ desc: evento.descriptionOn, [`hp_${attaccante.id}`]: attaccante.hp, [`hp_${difensore.id}`]: difensore.hp })
            }
        }
        // se l'evento è attivo, c'è il 10% che si fermi
        else {
            let checkTriggerEvent = Math.floor(Math.random() * 100) + 1; //da 1 a 100
            if (checkTriggerEvent < 10) {
                isEventActive = false
                history.push({ desc: evento.descriptionOff, [`hp_${attaccante.id}`]: attaccante.hp, [`hp_${difensore.id}`]: difensore.hp })
            }
        }
    }

    let malus = 0
    let malusTipo = ''
    let skipTurn = false
    let hasPerkResFromPendant = false

    let desc = ""

    if (attaccante.condizione.name) {
        //console.log(attaccante.condizione);
        //console.log(attaccante.pendantBonus);

        //ha un pendente che da resistenza a questa condizione
        if (attaccante.pendantBonus && attaccante.pendantBonus[attaccante.condizione.name.toLowerCase()]) {
            let checkSkipPct = Math.floor(Math.random() * 15) + 75; //da 75 a 90
            //console.log(checkSkipPct);
            let checkSkip = Math.floor(Math.random() * 100) + 1; //da 1 a 100
            //console.log(checkSkip);

            //ts superato
            if (checkSkip <= checkSkipPct) {
                const textCondizione = convertConditionNamePositive(attaccante.condizione.name)
                desc = `${attaccante.name} ${textCondizione}! `
                //console.log("condizione superata", desc);
                attaccante.condizione = {}

                hasPerkResFromPendant = true
            }
        }

        //console.log("hasPerkResFromPendant = ", hasPerkResFromPendant);

        // se non ha superato il ts grazie al pendente
        if (!hasPerkResFromPendant) {
            if (attaccante.condizione.effect.includes("skip")) {
                let checkSkip = Math.floor(Math.random() * 100) + 1; //da 1 a 100
                //console.log(checkSkip, attaccante.condizione.pct);
                if (checkSkip <= attaccante.condizione.pct) {
                    const textCondizione = convertConditionName(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! Skip his turn! `
                    //console.log("condizione skip", desc);
                    skipTurn = true
                }
                else {
                    const textCondizione = convertConditionNamePositive(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! `
                    //console.log("condizione superata", desc);
                    attaccante.condizione = {}
                }
            }
            else {
                let checkCondizione = Math.floor(Math.random() * 100) + 1; //da 1 a 100

                if (attaccante.condizione.pct < checkCondizione) {
                    const textCondizione = convertConditionNamePositive(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! `
                    //console.log("condizione superata", desc);
                    attaccante.condizione = {}
                }
                else {
                    const infoMalus = attaccante.condizione.effect.split("_")
                    malus = infoMalus[1]
                    malusTipo = infoMalus[2]
                    const textCondizione = convertConditionName(attaccante.condizione.name)
                    desc = `${attaccante.name} ${textCondizione}! `
                    //console.log("condizione malus", desc);
                }
            }
        }
    }

    if (skipTurn) {
        fineTurno(attaccante, difensore, desc, false)
    }
    else {
        const spellSelectedAtk = attaccante.spellSelected
        let atkAttaccante = attaccante.attack + spellSelectedAtk.atkBase
        if (attaccante.level && attaccante.level > 160) {
            atkAttaccante += attaccante['upgrades-spell'].attack.int
        }

        //controlliamo se ha bonus dall'evento
        if (isEventActive && evento.elements.includes(attaccante.element.toLowerCase())) {
            atkAttaccante += evento.bonus.attack
        }

        if (malusTipo && malusTipo === "atk") {
            atkAttaccante -= parseInt(malus)
        }

        let tiro = Math.floor(Math.random() * 20) + 1; //da 1 a 20
        let atkTot = tiro + atkAttaccante

        //console.log(atkAttaccante);

        let hasDebolezza = false
        let hasResistenza = false

        let difesaDif = difensore.defense

        //console.log(difesaDif);

        if (difensore.condizione.name) {
            if (difensore.condizione.effect.includes("def")) {
                const infoMalus = difensore.condizione.effect.split("_")
                difesaDif -= parseInt(infoMalus[1])
            }
        }

        if ((atkTot >= difesaDif || tiro >= 18) && tiro !== 1) {

            const dannoBase = attaccante.damage
            let dannoSpell = dannoBase + attaccante.spellSelected.dmgBase
            if (attaccante.level && attaccante.level > 160) {
                dannoSpell += attaccante['upgrades-spell'].damage.int
            }

            if (isEventActive && evento.elements.includes(attaccante.element.toLowerCase())) {
                dannoSpell += evento.bonus.damage
            }

            if (malusTipo === "dmg") {
                dannoSpell -= parseInt(malus)
            }

            let danno = dannoSpell + (Math.floor(Math.random() * 5) - 2)

            if (attaccante.element.toLowerCase() === difensore.weakness.toLowerCase()) {
                danno *= 2
                hasDebolezza = true
            }
            else if (attaccante.element.toLowerCase() === difensore.resistance.toLowerCase()) {
                danno = Math.floor(danno/2)
                hasResistenza = true
            }

            //ha un pendente con una flat resistance all'elemento dell'attaccante
            if (difensore.pendantBonus && difensore.pendantBonus[attaccante.element.toLowerCase()]) {
                danno -= difensore.pendantBonus[attaccante.element.toLowerCase()]
            }

            if (danno < 1) {
                danno = 1
            }

            difensore.hp -= danno

            if (difensore.hp > 0) {
                if (attaccante.spellSelected.condition.name) {
                    const textCondizione = convertConditionName(attaccante.spellSelected.condition.name)
                    desc = `${difensore.name} ${textCondizione}! `
                    difensore.condizione = attaccante.spellSelected.condition
                }

                if (!hasDebolezza && !hasResistenza) {
                    if (desc.includes("no longer")) {
                        desc = `${desc}${attaccante.name} hits ${difensore.name} and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left).`
                    }
                    else {
                        desc = `${attaccante.name} hits ${difensore.name} and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left). ${desc}`
                    }
                }
                else if (hasDebolezza) {
                    if (desc.includes("no longer")) {
                        desc = `${desc}${attaccante.name} hits ${difensore.name}, who is weak to ${attaccante.element}, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left).`
                    }
                    else {
                        desc = `${attaccante.name} hits ${difensore.name}, who is weak to ${attaccante.element}, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left). ${desc}`
                    }
                }
                else if (hasResistenza) {
                    if (desc.includes("no longer")) {
                        desc = `${desc}${attaccante.name} hits ${difensore.name}, who is ${attaccante.element} resistant, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left).`
                    }
                    else {
                        desc = `${attaccante.name} hits ${difensore.name}, who is ${attaccante.element} resistant, and deals ${danno} damage (${difensore.name} has ${difensore.hp} hp left). ${desc}`
                    }
                }

                fineTurno(attaccante, difensore, desc, false)
            }
            else {
                desc = `${desc}${attaccante.name} hits and ${difensore.name} is K.O., the round is over!`
                fineTurno(attaccante, difensore, desc, true)
            }
        }
        else {
            desc = `${desc}${attaccante.name} misses ${difensore.name}`
            fineTurno(attaccante, difensore, desc, false)
        }
    }
}

const fineTurno = (attaccante, difensore, desc, end) => {

    const obj = { desc, [`hp_${attaccante.id}`]: attaccante.hp, [`hp_${difensore.id}`]: difensore.hp }
    history.push(obj)

    if (end) {
        //console.log(history)
        winner = attaccante.id
        isEnd = true
    }
    else {
        turno(difensore, attaccante)
    }
}

export default fight
