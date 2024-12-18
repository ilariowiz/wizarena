import React from 'react'
import moment from 'moment'
import headerLeague from './HeaderLeagueTournament'
import titleTournament from './TitleTournament'
import { CTA_COLOR } from '../../../actions/types'

const renderInfoTournament = (tournament, montepremi, buyin, subscribed, mainTextColor, infoText, history) => {

    const dateStart = moment(tournament.start.seconds * 1000)
    const dateStartString = moment(dateStart).format("dddd, MMMM Do YYYY, h:mm:ss a");

    let titleTour = "The Weekly Tournament"
    let titleLeague = "The Twelve League"

    if (tournament.type === "elite") {
        titleTour = "The Farmers Tournament"
        titleLeague = "The Farmers League"
    }
    else if (tournament.type === "apprentice") {
        titleTour = "The Apprentice Tournament"
        titleLeague = "The Apprentice League"
    }

    return (
        <div style={{ width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>

            {
                tournament.showLeague ?
                titleTournament(`${titleLeague} ${tournament.leagueTournament}`, mainTextColor)
                :
                titleTournament(titleTour, mainTextColor)
            }

            <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10 }}>
                Tournament start: {dateStartString}
            </p>

            <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

            <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 10 }}>
                Buyin <span className="text-bold">{buyin || '...'}</span> ${tournament.coinBuyin}
            </p>

            <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 10 }}>
                Registered Wizards <span className="text-bold">{subscribed ? subscribed.length : '...'}</span>
            </p>

            <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 10 }}>
                Tournament Level Cap <span className="text-bold">{tournament.levelCap}</span>
            </p>

            <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginTop: 10, marginBottom: 15 }} />

            {
                tournament.showLeague &&
                headerLeague(tournament, mainTextColor, history)
            }

            <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 15 }} className="text-bold">
                Total prize {montepremi || '...'} ${tournament.coinBuyin}
            </p>

            {
                !infoText ?
                <button
                    className='btnH'
                    style={styles.btnSubscribe}
                    onClick={() => history.replace('/tournaments')}
                >
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Subscribe your wizards
                    </p>
                </button>
                :
                <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 20 }}>
                    {infoText}
                </p>
            }

            {
                !infoText &&
                <div style={{ width: "100%", height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 10 }} />
            }
        </div>
    )
}

const styles = {
    btnSubscribe: {
        width: 250,
		height: 40,
        minHeight: 40,
        marginBottom: 20,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
	},
}

export default renderInfoTournament
