import React from 'react'

let history = []
let isEnd = false
let winner = undefined
let evento = undefined
let isEventActive = false

let player1 = ""
let player2 = ""

const fight = (s1, s2, ev, callback) => {
    let s1copy = Object.assign({}, s1)
    let s2copy = Object.assign({}, s2)

    player1 = s1copy.id
    player2 = s2copy.id

    s1copy['condizione'] = {}
    s2copy['condizione'] = {}

    // S1 RING
    if (s1copy.ring && s1copy.ring['bonus']) {
        const stats = s1copy.ring.bonus.split(",")
        stats.map(i => {
            const infos = i.split("_")
            s1copy[infos[1]] += parseInt(infos[0])
        })

        history.push(`${s1copy.name} wear a ${s1copy.ring.name}`)
    }

    // S2 RING
    if (s2copy.ring && s2copy.ring['bonus']) {
        const stats = s2copy.ring.bonus.split(",")
        stats.map(i => {
            const infos = i.split("_")
            s2copy[infos[1]] += parseInt(infos[0])
        })

        history.push(`${s2copy.name} wear a ${s2copy.ring.name}`)
    }

    //console.log(s1copy, s2copy);
    //return

    if (ev) {
        evento = Object.assign({}, ev)
    }

    let iniziativa1 = Math.floor(Math.random() * 20) + 1; //da 1 a 20
    iniziativa1 = iniziativa1 + s1copy.speed

    let iniziativa2 = Math.floor(Math.random() * 20) + 1; //da 1 a 20
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
                history.push(evento.descriptionOn)
            }
        }
        // se l'evento è attivo, c'è il 10% che si fermi
        else {
            let checkTriggerEvent = Math.floor(Math.random() * 100) + 1; //da 1 a 100
            if (checkTriggerEvent < 10) {
                isEventActive = false
                history.push(evento.descriptionOff)
            }
        }
    }

    let malus = 0
    let malusTipo = ''
    let skipTurn = false

    let desc = ""

    if (attaccante.condizione.name) {

        //console.log(attaccante.condizione);

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

    if (skipTurn) {
        fineTurno(attaccante, difensore, desc, false)
    }
    else {
        const spellSelectedAtk = attaccante.spellSelected
        let atkAttaccante = attaccante.attack + spellSelectedAtk.atkBase

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

        if ((atkTot >= difesaDif || tiro >= 19) && tiro !== 1) {

            const dannoBase = attaccante.damage
            let dannoSpell = dannoBase + attaccante.spellSelected.dmgBase

            if (isEventActive && evento.elements.includes(attaccante.element.toLowerCase())) {
                dannoSpell += evento.bonus.damage
            }

            if (malusTipo === "dmg") {
                dannoSpell -= parseInt(malus)
            }

            let danno = dannoSpell + (Math.floor(Math.random() * 5) - 2)

            if (attaccante.element.toLowerCase() === difensore.weakness) {
                danno *= 2
                hasDebolezza = true
            }
            else if (attaccante.element.toLowerCase() === difensore.resistance) {
                danno = Math.floor(danno/2)
                hasResistenza = true
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
