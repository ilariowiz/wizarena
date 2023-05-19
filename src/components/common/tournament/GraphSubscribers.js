import React from 'react'

const elements = [
    [{color: "#88f71e", name: "Acid"},
    {color: "#5b30b7", name: "Dark"},
    {color: "#503631", name: "Earth"},
    {color: "#cc1919", name: "Fire"}],
    [{color: "#11c8ee", name: "Ice"},
    {color: "#840fb2", name: "Psycho"},
    {color: "#b2e5ef", name: "Spirit"},
    {color: "#faf000", name: "Sun"}],
    [{color: "#e6dc0c", name: "Thunder"},
    {color: "#4b0082", name: "Undead"},
    {color: "#15a3c7", name: "Water"},
    {color: "#afb9cc", name: "Wind"}],
]

const graphSubscribers = (avgLevel, mainTextColor, subscribed, subscribedSpellGraph) => {
    return (
        <div style={{ flexDirection: 'column', marginBottom: 20 }}>
            {
                avgLevel &&
                <div style={{ marginBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: 20, color: mainTextColor, marginRight: 10 }} className="text-bold">
                        Avg level
                    </p>
                    <p style={{ fontSize: 20, color: mainTextColor }} className="text-bold">
                        {avgLevel}
                    </p>
                </div>
            }

            <div style={{ flexWrap: 'wrap', flexDirection: 'column' }}>

                {
                    elements.map((i, idx) => {
                        return renderRowGraph(i, idx, mainTextColor, subscribed, subscribedSpellGraph)
                    })
                }

            </div>
        </div>
    )
}

const renderRowGraph = (rows, idx, mainTextColor, subscribed, subscribedSpellGraph) => {
    return (
        <div style={{ alignItems: 'center', justifyContent: 'space-between' }} key={idx}>
            {rows.map((item, index) => {
                return renderSingleGraph(item.color, item.name, mainTextColor, subscribed, subscribedSpellGraph, index)
            })}
        </div>
    )
}

const renderSingleGraph = (color, name, mainTextColor, subscribed, subscribedSpellGraph, index) => {
    let number = 0
    let pct = 0

    if (subscribedSpellGraph && subscribedSpellGraph[name]) {
        number = subscribedSpellGraph[name]
        pct = number / subscribed.length * 100
    }

    return (
        <div style={{ alignItems: 'center', marginBottom: 5, flex: 1, height: 30 }} key={index}>
            <div style={{ height: 20, width: 20, borderRadius: 4, backgroundColor: color, marginRight: 8 }} />

            <p style={{ color: mainTextColor, fontSize: 15, marginRight: 8 }}>
                {name}
            </p>

            <p style={{ color: mainTextColor, fontSize: 15 }} className="text-medium">
                {number} ({pct.toFixed(1)}%)
            </p>
        </div>
    )
}

export default graphSubscribers
