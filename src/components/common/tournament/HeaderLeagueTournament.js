import React from 'react'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';


const headerLeague = (tournament, mainTextColor, history) => {

    return (
        <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>

            {
                tournament.type === "weekly" &&
                <div style={{ alignItems: 'center', marginBottom: 15 }}>
                    <p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
                        Region:
                    </p>
                    <Popup
                        trigger={open => (
                            <p style={{ textDecoration: "underline", fontSize: 16, color: mainTextColor, cursor: 'pointer' }}>
                                {tournament.region}
                            </p>
                        )}
                        position="bottom center"
                        on="hover"
                    >
                        <div style={{ padding: 10 }}>
                            <p style={{ fontSize: 16, color: "#1d1d1f", lineHeight: 1.2 }}>
                                {tournament.regionDescription}
                            </p>
                        </div>
                    </Popup>
                </div>
            }

            <div style={{ alignItems: 'center', marginBottom: 15 }}>
                <p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
                    Event:
                </p>
                <Popup
                    trigger={open => (
                        <p style={{ textDecoration: "underline", fontSize: 16, color: mainTextColor, cursor: 'pointer' }}>
                            {tournament.event}
                        </p>
                    )}
                    position="bottom center"
                    on="hover"
                >
                    <div style={{ padding: 10 }}>
                        <p style={{ fontSize: 16, color: "#1d1d1f", lineHeight: 1.2 }}>
                            {tournament.eventDescription}
                        </p>
                    </div>
                </Popup>
            </div>

            <a
                className="btnH"
                href={`${window.location.protocol}//${window.location.host}/league`}
                style={styles.btnRanking}
                onClick={(e) => {
                    e.preventDefault()
                    history.push(`./league`)
                }}
            >
                <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                    Ranking
                </p>
            </a>

        </div>
    )
}

const styles = {
    btnRanking: {
        borderRadius: 4,
        width: 150,
        height: 40,
        cursor: 'pointer',
        borderColor: "#d7d7d7",
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    }
}

export default headerLeague
