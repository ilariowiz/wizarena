import React from 'react'


const titleTournament = (title, mainTextColor) => {
    return (
        <p style={{ fontSize: 24, color: mainTextColor, marginBottom: 10 }} className="text-medium">
            {title}
        </p>
    )
}

export default titleTournament
