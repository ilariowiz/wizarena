import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import NftCardTournament from './common/NftCardTournament'
import Header from './Header'
import boxPairTournament from './common/tournament/BoxPairTournament'
import renderInfoTournament from './common/tournament/InfoTournament'
import graphSubscribers from './common/tournament/GraphSubscribers'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import convertMedalName from './common/ConvertMedalName'
import { MAIN_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    getMontepremi,
    getBuyin,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed,
    loadUserMintedNfts,
    getPotionEquippedMass,
    getInfoItemEquippedMass
} from '../actions'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


class Tournament extends Component {
    constructor(props) {
		super(props)

		this.state = {
            tournament: {},
			winners: [],
            loading: true,
            yourStat: "",
            avgLevel: 0,
            matchPair: [],
            userMinted: [],
            potionsEquipped: [],
            ringsEquipped: []
		}
	}

    componentDidMount() {
		document.title = "Tournament - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadTournament()
            this.loadMinted()
        }, 500)
	}

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
				this.setState({ userMinted: response })
			})
		}
	}

    async loadTournament() {
        const { chainId, gasPrice, gasLimit, networkUrl, subscribed } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage"))

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
			const tournament = doc.data()

            /*
            const tournament = {
                canSubscribe: false,
                nRounds: 6,
                name: "t7_r6",
                roundEnded: "5",
                showPair: false,
                showLeague: true,
                region: "ciao",
                event: "sunburst",
                start: {seconds: 1671715800, nanoseconds: 843000000},
                tournamentEnd: false
            }
            */


            this.setState({ tournament }, async () => {

                if (subscribed) {
                    this.calcSubscribers(subscribed, tournament)
                }

                this.props.getMontepremi(chainId, gasPrice, gasLimit, networkUrl)
				this.props.getBuyin(chainId, gasPrice, gasLimit, networkUrl, "buyin-key")
				this.props.getFeeTournament(chainId, gasPrice, gasLimit, networkUrl, "fee-tournament-key")


                this.loadPair(tournament.name)

                const tournamentName = tournament.name.split("_")[0]

                this.props.getSubscribed(chainId, gasPrice, gasLimit, networkUrl, tournamentName, "kda", (subscribed) => {

                    //console.log(subscribed);
                    this.calcSubscribers(subscribed, tournament)
                })

            })
        })
    }

    calcSubscribers(subscribed, tournament) {
        const { account } = this.props

        const roundEnded = tournament.roundEnded
        const tournamentName = tournament.name.split("_")[0]

        this.getAllPotionsEquipped(subscribed, tournamentName)
        this.getRingsEquipped(subscribed)

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
    }

    getAllPotionsEquipped(subscribers, tournamentName) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        let keys = []
        subscribers.map(i => {
            keys.push(`"${tournamentName}_${i.id}"`)
        })

        this.props.getPotionEquippedMass(chainId, gasPrice, gasLimit, networkUrl, keys, (response) => {
            //console.log(response);
            this.setState({ potionsEquipped: response })
        })
    }

    getRingsEquipped(subscribers) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        let idnfts = []
        subscribers.map(i => {
            idnfts.push(i.id)
        })

        //console.log(idnfts);

        this.props.getInfoItemEquippedMass(chainId, gasPrice, gasLimit, networkUrl, idnfts, (response) => {
            //console.log(response);
            this.setState({ ringsEquipped: response })
        })
    }

    async loadPair(id) {
        const docRef = doc(firebasedb, "matching", id)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()
        //console.log(data);

        if (data) {
            this.setState({ matchPair: data.couples })
        }
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
        const { potionsEquipped, tournament, ringsEquipped } = this.state

        //per ogni row creiamo un array di GameCard
		return (
            <div style={{ marginBottom: 15 }} key={index}>
                <NftCardTournament
                    item={item}
                    key={index}
                    history={this.props.history}
                    width={width}
                    potionsEquipped={potionsEquipped}
                    ringsEquipped={ringsEquipped}
                    tournamentName={tournament.name.split("_")[0]}
                    tournamentSeason={tournament.season}
                />
            </div>
        )
    }

    renderBody(isMobile) {
        const { tournament, avgLevel } = this.state
        const { buyin, subscribed, mainTextColor, subscribedKdaSpellGraph, montepremi } = this.props

        //console.log(buyin);

        const { boxW, padding } = getBoxWidth(isMobile)

        if (this.state.loading) {
            return (
                <div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', padding, overflowY: 'auto', overflowX: 'hidden' }}>
                    <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                    </div>
                </div>
            )
        }

        if (!tournament.name) {
            return <div> </div>
        }

        //console.log(tournament.showLeague);
        const roundName = tournament.name.split("_")[1]

        //LE ISCRIZIONI SONO APERTE
		if (tournament && tournament.canSubscribe) {

			return (
				<div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

					{renderInfoTournament(tournament, montepremi, buyin, subscribed, mainTextColor, undefined, this.props.history)}

                    {
                        subscribed && subscribed.length > 0 &&
                        graphSubscribers(avgLevel, mainTextColor, subscribed, subscribedKdaSpellGraph)
                    }

                    {
                        subscribed && subscribed.length > 0 &&
                        <div style={{ marginBottom: 30, flexWrap: 'wrap', width: boxW }}>
                            {subscribed.map((item, index) => {
                                return this.renderRow(item, index, 230)
                            })}
                        </div>
                    }
				</div>
			)
		}

        //SE SIAMO IN ATTESA DEL PRIMO FIGHT E NO PAIR per il primo round
		if (tournament && !tournament.canSubscribe && !tournament.tournamentEnd && tournament.roundEnded === "0" && !tournament.showPair) {

			const roundValue = roundName.replace("r", "")

			const start = moment(tournament.start.seconds * 1000) //milliseconds
			let text;
			if (moment().isBefore(start)) {
				text = `Round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                    {renderInfoTournament(tournament, montepremi, buyin, subscribed, mainTextColor, text, this.props.history)}

                    {
                        subscribed && subscribed.length > 0 &&
                        graphSubscribers(avgLevel, mainTextColor, subscribed, subscribedKdaSpellGraph)
                    }

                    {
                        subscribed && subscribed.length > 0 &&
                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                            {subscribed.map((item, index) => {
                                return this.renderRow(item, index, 220)
                            })}
                        </div>
                    }
				</div>
			)
		}

        if (tournament && tournament.showPair && this.state.matchPair.length > 0) {
            return this.renderMatchPair(boxW, isMobile, padding)
        }

        return this.renderRoundConcluso(boxW, isMobile, padding)
    }

    renderMatchPair(boxW, isMobile, padding) {
        const { matchPair, tournament, userMinted } = this.state
        const { mainTextColor, subscribed, montepremi, buyin } = this.props

        const roundName = tournament.name.split("_")[1]

        const infoText = `Pairings of round ${roundName.replace("r", "")}`

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                {renderInfoTournament(tournament, montepremi, buyin, subscribed, mainTextColor, infoText, this.props.history)}

                <div style={{ width: boxW, flexWrap: 'wrap' }}>
                    {matchPair.map((item, index) => {
                        return boxPairTournament(item, index, userMinted, mainTextColor, subscribed)
                    })}
                </div>
            </div>
        )
    }

    renderRoundConcluso(boxW, isMobile, padding) {
        const { tournament, winners, yourStat } = this.state
        const { mainTextColor, montepremi, buyin, subscribed } = this.props

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
            text = `Round ${roundValue} will start ${start.fromNow()}`
        }
        else {
            text = `Round started ${start.fromNow()}`
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
                        `${text}. Partial results (round ${roundEnded}/${tournament.nRounds} concluded)`


        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                {renderInfoTournament(tournament, montepremi, buyin, subscribed, mainTextColor, titleText, this.props.history)}

                {
                    yourStat &&
                    <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 20, textAlign: 'center' }}>
                        {yourStat}
                    </p>
                }

                {
                    subtitleText6 &&
                    <div style={{ flexDirection: 'column', marginBottom: 60, alignItems: 'center' }}>
                        <div
                            style={Object.assign({}, styles.boxPodio, { borderColor: 'gold' })}
                        >
                            <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
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
                    <div style={{ flexDirection: 'column', marginBottom: 60, alignItems: 'center' }}>
                        <div style={Object.assign({}, styles.boxPodio, { borderColor: 'silver' })}>
                            <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
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

                <div style={{ flexDirection: 'column', marginBottom: 60, alignItems: 'center' }}>
                    <div style={Object.assign({}, styles.boxPodio, { borderColor: '#CD7F32' })}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            {subtitleText4}
                        </p>
                    </div>

                    <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                        {winners4.map((item, index) => {
                            return this.renderRow(item, index, 260);
                        })}
                    </div>
                </div>

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
                <Header
                    page='home'
                    section={7}
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
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
					render={() => this.renderTopHeader(false)}
				/>

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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "white"
	},
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
    boxPodio: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 4,
        borderStyle: 'solid',
        marginBottom: 15,
        width: "fit-content"
    },
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, montepremi, buyin, feeTournament, subscribed, subscribedKdaSpellGraph, mainTextColor } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, montepremi, buyin, feeTournament, subscribed, subscribedKdaSpellGraph, mainTextColor };
}

export default connect(mapStateToProps, {
    getBuyin,
    getMontepremi,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed,
    loadUserMintedNfts,
    getPotionEquippedMass,
    getInfoItemEquippedMass
})(Tournament)
