import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import { collection, getDocs } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import NftCardTournament from './common/NftCardTournament'
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import convertMedalName from './common/ConvertMedalName'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import { MAIN_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    getMontepremi,
    getBuyin,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed
} from '../actions'
import '../css/Nft.css'


class Tournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            tournament: {},
			winners: [],
            loading: true,
            yourStat: "",
            avgLevel: 0
		}
	}

    componentDidMount() {
		document.title = "Tournament - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadTournament()
        }, 500)
	}

    async loadTournament() {
        const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage"))

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
			const tournament = doc.data()
            this.setState({ tournament }, async () => {

                this.props.getMontepremi(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl)


                const roundEnded = tournament.roundEnded
                const tournamentName = tournament.name.split("_")[0]

                this.props.getSubscribed(chainId, gasPrice, gasLimit, networkUrl, tournamentName, (subscribed) => {

                    const winners = []
                    const winners4 = []
                    const winners5 = []
                    const winners6 = []

                    let yourWizards = 0
                    let winnerWizards = 0

                    subscribed.map((item) => {
                        //console.log(item);
                        if (item.owner === account.account) {
                            yourWizards++
                        }

                        if (item.medals[tournamentName]) {

                            //se un tuo wiz ha vinto lo stesso numero di medaglie del round appena concluso è ancora in gara per vincere
                            if (item.medals[tournamentName] === roundEnded && item.owner === account.account) {
                                winnerWizards++
                            }

                            //se siamo ad un round inferiore al 5
                            if (parseInt(roundEnded) < 5) {
                                if (item.medals[tournamentName] === roundEnded) {
                                    winners4.push(item)
                                }
                            }
                            else {
                                if (item.medals[tournamentName] === "4") {
                                    winners4.push(item)
                                }
                                if (item.medals[tournamentName] === "5") {
                                    winners5.push(item)
                                }
                                if (item.medals[tournamentName] === "6") {
                                    winners6.push(item)
                                }
                            }
                        }
                    })

                    //console.log(yourWizards , "/", winnerWizards);

                    //console.log(winners);
                    winners.push(winners4)
                    winners.push(winners5)
                    winners.push(winners6)

                    let yourStat;
                    if (roundEnded === "6") {
                        yourStat = `Your winning Wizards ${winnerWizards} / ${yourWizards}`
                    }
                    else {
                        yourStat = `Your Wizards still in the game ${winnerWizards} / ${yourWizards}`
                    }

                    const avgLevel = this.calcAvgLevel(subscribed)
                    //console.log(avgLevel);

                    this.setState({ winners, yourStat, avgLevel, loading: false })
                })

            })
        })
    }

    calcAvgLevel(array) {
        let sum = 0
        array.map(i => {
            if (i.level) {
                sum += i.level
            }
        })

        return Math.round(sum / array.length)
    }

    renderRow(item, index, width) {
        //per ogni row creiamo un array di GameCard
		return (
            <div style={{ marginBottom: 15 }} key={index}>
                <NftCardTournament
                    item={item}
                    key={index}
                    history={this.props.history}
                    width={width}
                />
            </div>
        )
    }

    renderInfoTournament(width) {
		const { tournament } = this.state
		const { montepremi, subscribed } = this.props

		const tname = convertMedalName(tournament.name)

		return (
			<div style={{ width, flexDirection: 'column', marginLeft: 15 }}>
				<p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					{tname.torneo.toUpperCase()}
				</p>

				<p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					{tname.round.toUpperCase()}
				</p>

                <p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					NUMBER OF ROUNDS {tournament.nRounds}
				</p>

				<p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					Total Prize {montepremi || '...'} KDA
				</p>

                <p style={{ fontSize: 18, color: 'white', marginBottom: 15 }}>
					Registered Wizards {subscribed ? subscribed.length : '...'}
				</p>

                <a
                    style={styles.btnRules}
                    href="https://wizardsarena.gitbook.io/wizards-arena/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        Rules
                    </p>
                </a>
			</div>
		)
	}

    renderSingleGraph(color, name) {
        const { subscribed, subscribedSpellGraph } = this.props

        let number = 0
        let pct = 0

        if (subscribedSpellGraph[name]) {
            number = subscribedSpellGraph[name]
            pct = number / subscribed.length * 100
        }

        return (
            <div style={{ alignItems: 'center', marginRight: 10, marginBottom: 10 }}>
                <div style={{ height: 20, width: 20, borderRadius: 2, backgroundColor: color, marginRight: 8 }} />

                <p style={{ color: 'white', fontSize: 16, marginRight: 8 }}>
                    {name}
                </p>

                <p style={{ color: 'white', fontSize: 16 }}>
                    {number} ({pct.toFixed(1)}%)
                </p>
            </div>
        )
    }

    renderGraph() {
        const { avgLevel } = this.state

        return (
            <div style={{ flexDirection: 'column', marginTop: 25 }}>

                {
                    avgLevel &&
                    <div style={{ marginBottom: 15, alignItems: 'center' }}>
                        <p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
                            AVERAGE LEVEL
                        </p>
                        <p style={{ fontSize: 22, color: getColorTextBasedOnLevel(avgLevel) }}>
                            {avgLevel}
                        </p>
                    </div>
                }

                <div style={{ flexWrap: 'wrap' }}>
                    {this.renderSingleGraph('#88f71e', 'Acid')}
                    {this.renderSingleGraph('#5b30b7', 'Dark')}
                    {this.renderSingleGraph('#cc1919', 'Fire')}
                    {this.renderSingleGraph('#11c8ee', 'Ice')}
                    {this.renderSingleGraph('#e6dc0c', 'Thunder')}
                    {this.renderSingleGraph('#afb9cc', 'Wind')}
                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { tournament } = this.state
        const { buyin, subscribed } = this.props

        const { boxW } = getBoxWidth(isMobile)

        if (!tournament.name) {
            return <div> </div>
        }

        //console.log(tournament);

        const wizaPrize = buyin && subscribed && buyin * 45

        const roundName = tournament.name.split("_")[1]

        //LE ISCRIZIONI SONO APERTE
		if (tournament && tournament.canSubscribe) {

            const dateStart = moment(tournament.start.seconds * 1000)
            //console.log(dateStart);

            const dateStartString = moment(dateStart).format("dddd, MMMM Do YYYY, h:mm:ss a");
            const dateStartTo = moment().to(dateStart)

			return (
				<div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 19, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is open. The tournament will start:
							</p>

                            <p style={{ fontSize: 19, color: 'white', marginBottom: 5 }}>
								{dateStartTo}
							</p>
                            <p style={{ fontSize: 16, color: 'white', marginBottom: 20 }}>
								{dateStartString}
							</p>

							<p style={{ fontSize: 22, color: 'white', marginBottom: 20 }}>
								BUY-IN {buyin || '...'} KDA
							</p>

                            <p style={{ fontSize: 17, color: 'white', marginBottom: 15 }}>
            					Participation reward (for each wizard) {wizaPrize || '...'} $WIZA
            				</p>
						</div>

						{this.renderInfoTournament(boxW)}
					</div>


					<button
                        className='btnH'
                        style={styles.btnSubscribe}
                        onClick={() => this.props.history.replace('/me')}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            Subscribe your wizards
                        </p>
                    </button>

                    {
                        subscribed && subscribed.length > 0 &&
                        this.renderGraph()
                    }

                    {
                        subscribed && subscribed.length > 0 &&
                        <div style={{ marginBottom: 30, flexWrap: 'wrap', marginTop: 15 }}>
                            {subscribed.map((item, index) => {
                                return this.renderRow(item, index, 220)
                            })}
                        </div>
                    }
				</div>
			)
		}

        //SE SIAMO IN ATTESA DEL PRIMO FIGHT
		if (tournament && !tournament.canSubscribe && !tournament.tournamentEnd && tournament.roundEnded === "0") {

			const roundValue = roundName.replace("r", "")

			const start = moment(tournament.start.seconds * 1000) //milliseconds
			let text;
			if (moment().isBefore(start)) {
				text = `The round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>
					<div style={{ width: '100%', justifyContent: 'space-between', marginBottom: 30 }}>

						<div style={{ flexDirection: 'column', width: '100%' }}>
							<p style={{ fontSize: 18, color: 'white', marginBottom: 20 }}>
								Registration for the tournament is closed!
							</p>

							<p style={{ fontSize: 18, color: 'white' }}>
								{text}
							</p>
						</div>

						{this.renderInfoTournament(boxW)}
					</div>
				</div>
			)
		}

        return this.renderRoundConcluso(boxW)
    }

    renderRoundConcluso(boxW) {
        const { tournament, winners, yourStat } = this.state

        if (!winners || winners.length === 0) {
            return <div />
        }

        const roundName = tournament.name.split("_")[1]
        const roundEnded = tournament.roundEnded

        // TORNEO/ROUND CONCLUSO
        const roundValue = roundName.replace("r", "")

        const start = moment(tournament.start.seconds * 1000) //milliseconds
        let text;
        if (moment().isBefore(start)) {
            text = `The round ${roundValue} will start ${start.fromNow()}`
        }
        else {
            text = `The round started ${start.fromNow()}`
        }

        //console.log(winners);

        const winners4 = winners[0]
        const winners5 = winners[1]
        const winners6 = winners[2]

        let subtitleText4 = ""
        let subtitleText5 = ""
        let subtitleText6 = ""
        if (parseInt(roundEnded) < 5) {
            subtitleText4 = winners4.length > 1 ?  `The ${winners4.length} winners of ${roundEnded} medals:` : `The winner of ${roundEnded} medals:`
        }
        else {
            subtitleText4 = winners4.length > 1 ? `The ${winners4.length} winners of 4 medals:` : `The winner of 4 medals:`
            subtitleText5 = winners5.length > 0 ? `The ${winners5.length} winners of 5 medals:` : ""
            subtitleText6 = winners6.length > 0 ? `The ${winners6.length} winners of 6 medals:` : ""
        }

        let titleText = tournament.tournamentEnd ?
                        "The tournament is over! Let's see who the winners are"
                        :
                        `Partial results of this tournament (round ${roundEnded}/${tournament.nRounds} concluded)`


        return (
            <div style={{ width: boxW, flexDirection: 'column', paddingTop: 30 }}>

                <div style={{ justifyContent: 'space-between', marginBottom: 30 }}>

                    <div style={{ flexDirection: 'column', width: '100%' }}>
                        <p style={{ fontSize: 20, color: 'white', marginBottom: 25 }}>
                            {titleText}
                        </p>

                        {
                            !tournament.tournamentEnd &&
                            <p style={{ fontSize: 18, color: 'white' }}>
                                {text}
                            </p>
                        }
                    </div>

                    {this.renderInfoTournament(boxW)}

                </div>

                {
                    yourStat &&
                    <p style={{ fontSize: 19, color: 'white', marginBottom: 25 }}>
                        {yourStat}
                    </p>
                }

                {
                    subtitleText6 &&
                    <div style={{ flexDirection: 'column', marginBottom: 60 }}>
                        <div
                            style={Object.assign({}, styles.boxPodio, { borderColor: 'gold' })}
                        >
                            <p style={{ fontSize: 20, color: 'white' }}>
                                {subtitleText6}
                            </p>
                        </div>

                        <div style={{ flexWrap: 'wrap' }}>
                            {winners6.map((item, index) => {
                                return this.renderRow(item, index, 260);
                            })}
                        </div>
                    </div>
                }

                {
                    subtitleText5 &&
                    <div style={{ flexDirection: 'column', marginBottom: 60 }}>
                        <div style={Object.assign({}, styles.boxPodio, { borderColor: 'silver' })}>
                            <p style={{ fontSize: 20, color: 'white' }}>
                                {subtitleText5}
                            </p>
                        </div>

                        <div style={{ flexWrap: 'wrap' }}>
                            {winners5.map((item, index) => {
                                return this.renderRow(item, index, 260);
                            })}
                        </div>
                    </div>
                }

                <div style={Object.assign({}, styles.boxPodio, { borderColor: '#CD7F32' })}>
                    <p style={{ fontSize: 20, color: 'white' }}>
                        {subtitleText4}
                    </p>
                </div>

                <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                    {winners4.map((item, index) => {
                        return this.renderRow(item, index, 260);
                    })}
                </div>

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={4}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
    container: {
		flexDirection: 'column',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
    btnSubscribe: {
        width: 250,
		height: 50,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 2,
	},
    boxPodio: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        borderStyle: 'solid',
        marginBottom: 15,
        width: "fit-content"
    },
    btnRules: {
        width: 100,
        height: 32,
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, montepremi, buyin, feeTournament, subscribed, subscribedSpellGraph } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, montepremi, buyin, feeTournament, subscribed, subscribedSpellGraph };
}

export default connect(mapStateToProps, {
    getBuyin,
    getMontepremi,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed
})(Tournament)
