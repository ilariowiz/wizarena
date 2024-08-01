import React, { Component } from 'react'
import Media from 'react-media';
import { connect } from 'react-redux'
import moment from 'moment'
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import DotLoader from 'react-spinners/DotLoader';
import { MdRemoveRedEye } from "react-icons/md";
import NftCardTournament from './common/NftCardTournament'
import Header from './Header'
import boxPairTournament from './common/tournament/BoxPairTournament'
import renderInfoTournament from './common/tournament/InfoTournament'
import graphSubscribers from './common/tournament/GraphSubscribers'
import BoxYourResults from './common/tournament/BoxYourResults'
import getBoxWidth from './common/GetBoxW'
import { MAIN_NET_ID, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed,
    loadUserMintedNfts,
    getPotionEquippedMass,
    getInfoItemEquippedMass,
    getBuyin,
    getFeeTournament,
    getCountForTournament
} from '../actions'
import '../css/Nft.css'


class TournamentElite extends Component {
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
            ringsEquipped: {},
            pendantsEquipped: {},
            subscribed: [],
            rankings: [],
            showProfileFights: false,
            showWizardsIn: false,
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
        const { chainId, gasPrice, gasLimit, networkUrl, subscribedElite } = this.props

        const querySnapshot = await getDocs(collection(firebasedb, "stage_elite"))

        querySnapshot.forEach(async (doc) => {
            //console.log(doc.data());
			const tournament = doc.data()

            //console.log(subscribedWiza);

            /*
            const tournament = {
                canSubscribe: false,
                nRounds: 4,
                name: "t3019_r3",
                roundEnded: "2",
                showPair: true,
                start: {seconds: 1671715800, nanoseconds: 843000000},
                tournamentEnd: false,
                rankingKey: "ranking_s5",
                showLeague: true,
                type: 'elite'
            }
            */


            let rankings = []
            if (tournament.showLeague) {
                const querySnapshotRanking = await getDocs(collection(firebasedb, tournament.rankingKey))
                querySnapshotRanking.forEach(doc => {
                    const d = doc.data()
                    //console.log(d, doc.id);
                    const obj = { id: doc.id, ranking: d.ranking }
                    rankings.push(obj)
                })
            }

            this.setState({ tournament, rankings }, async () => {

                const matchPair = await this.loadPair(tournament.name)

                if (subscribedElite && !tournament.showPair) {
                    this.calcSubscribers(subscribedElite, tournament, undefined, true)
                }

                const tournamentName = tournament.name.split("_")[0]

                this.props.getSubscribed(chainId, gasPrice, gasLimit, networkUrl, tournamentName, "elite", (subscribed) => {
                    //console.log(subscribed);
                    this.calcSubscribers(subscribed, tournament, matchPair, false)
                })

            })
        })
    }

    calcSubscribers(subscribed, tournament, matchPair, loading) {
        const { account } = this.props

        const roundEnded = tournament.roundEnded
        const tournamentName = tournament.name.split("_")[0]

        //this.getEquipmentEquipped(subscribed)

        let subs = []
        let yourWizards = 0
        let winnerWizards = 0

        //torneo non è iniziato
        if (roundEnded === "0") {
            subs = subscribed
        }

        subscribed.map(item => {
            if (item.owner === account.account) {
                yourWizards++
            }

            if (item.medals[tournamentName]) {

                //se un tuo wiz ha vinto lo stesso numero di medaglie del round appena concluso è ancora in gara per vincere
                if (item.medals[tournamentName] === roundEnded && item.owner === account.account) {
                    winnerWizards++
                }

                if (item.medals[tournamentName] === roundEnded && parseInt(roundEnded) > 0) {
                    subs.push(item)
                }
            }
        })

        //console.log(yourWizards , "/", winnerWizards);

        let yourStat;
        if (roundEnded === "4") {
            yourStat = `Your winning Wizards ${winnerWizards} / ${yourWizards}`
        }
        else {
            yourStat = `Your Wizards still in the game ${winnerWizards} / ${yourWizards}`
        }

        const avgLevel = this.calcAvgLevel(subscribed)
        //console.log(avgLevel);

        if (matchPair && matchPair.length > 0) {

            let yourPairings = []

            for (let i = 0; i < matchPair.length; i++) {
                const pairing = matchPair[i]
                const wiz1 = pairing.s1.id
                const wiz2 = pairing.s2.id

                const wiz1info = subscribed.find(i => i.id === wiz1)
                const wiz2info = subscribed.find(i => i.id === wiz2)

                //console.log(wiz2info, account.account);
                if ((wiz1info.owner === account.account) || (wiz2info && wiz2info.owner === account.account)) {
                    //console.log("your");

                    yourPairings.push(pairing)
                    matchPair.splice(i, 1)
                }
            }

            //console.log(yourPairings);

            if (yourPairings.length > 0) {
                //aggiungiamo i tuoi pairings all'inizio
                matchPair.splice(0, 0, ...yourPairings)
            }
        }

        //console.log(matchPair);

        this.setState({ subscribed: subs, yourStat, avgLevel, matchPair, loading })
    }

    /*
    async getEquipmentEquipped(subscribers) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        let idnfts = []
        let idnftsPendants = []
        subscribers.map(i => {
            idnfts.push(i.id)
            idnftsPendants.push(`${i.id}pendant`)
        })

        //console.log(idnfts);

        const rings = await this.props.getInfoItemEquippedMass(chainId, gasPrice, gasLimit, networkUrl, idnfts)

        const pendants = await this.props.getInfoItemEquippedMass(chainId, gasPrice, gasLimit, networkUrl, idnftsPendants)

        this.setState({ ringsEquipped: rings, pendantsEquipped: pendants })
    }
    */

    async loadPair(id) {
        const docRef = doc(firebasedb, "matching", id)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()
        //console.log(data);

        if (data) {
            //this.setState({ matchPair: data.couples })
            return data.couples
        }

        return []
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

    calcMontepremi() {
        const { tournament } = this.state
        const { subscribedElite } = this.props

        if (tournament.fee && subscribedElite) {
            const fee = tournament.buyin * tournament.fee / 100
            const totalFee = fee * subscribedElite.length
            let montepremi = (subscribedElite.length * tournament.buyin) - totalFee

            return montepremi
        }

        return ""
    }

    renderRow(item, index, width) {
        const { tournament, ringsEquipped, pendantsEquipped, rankings } = this.state

        //per ogni row creiamo un array di GameCard
		return (
            <div style={{ marginBottom: 15 }} key={index}>
                <NftCardTournament
                    item={item}
                    key={index}
                    history={this.props.history}
                    width={width}
                    tournamentName={tournament.name.split("_")[0]}
                    tournamentSeason={tournament.season}
                    rankings={rankings}
                    tournamentInfo={tournament}
                />
            </div>
        )
    }

    renderLoading() {
        const { loading } = this.state

        if (!loading) {
            return undefined
        }

        return (
            <div style={{ flexDirection: 'column', width: "100%", alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
                <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { tournament, subscribed, avgLevel, matchPair } = this.state
        const { subscribedElite, mainTextColor, subscribedEliteSpellGraph } = this.props

        //console.log(tournament, matchPair);

        const { boxW, padding } = getBoxWidth(isMobile)

        if (!tournament.name) {
            return this.renderLoading()
        }

        //console.log(tournament);
        const roundName = tournament.name.split("_")[1]

        //LE ISCRIZIONI SONO APERTE
		if (tournament && tournament.canSubscribe) {

            const dateStart = moment(tournament.start.seconds * 1000)
            //console.log(dateStart);

			return (
				<div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                    {this.renderLoading()}

                    {renderInfoTournament(tournament, this.calcMontepremi(), tournament.buyin, subscribedElite, mainTextColor, undefined, this.props.history)}

                    {
                        subscribedElite && subscribedElite.length > 0 &&
                        graphSubscribers(avgLevel, mainTextColor, subscribed, subscribedEliteSpellGraph)
                    }

                    {
                        subscribed && subscribed.length > 0 &&
                        <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
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
				text = `The round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                    {this.renderLoading()}

                    {renderInfoTournament(tournament, this.calcMontepremi(), tournament.buyin, subscribedElite, mainTextColor, text, this.props.history)}

                    {
                        subscribed && subscribed.length > 0 &&
                        graphSubscribers(avgLevel, mainTextColor, subscribed, subscribedEliteSpellGraph)
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

        if (tournament && tournament.showPair && matchPair && matchPair.length > 0) {
            return this.renderMatchPair(boxW, isMobile, padding)
        }
        else if (tournament && tournament.showPair && (!matchPair || (matchPair && matchPair.length === 0))) {
            return this.renderLoading()
        }

        return this.renderRoundConcluso(boxW, isMobile, padding)
    }

    renderMatchPair(boxW, isMobile, padding) {
        const { matchPair, tournament, userMinted, subscribed, rankings } = this.state
        const { mainTextColor, subscribedElite, isDarkmode } = this.props

        //console.log(subscribed);
        const roundName = tournament.name.split("_")[1]

        const infoText = `Pairings of round ${roundName.replace("r", "")}`

        return (
             <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                {this.renderLoading()}

                {renderInfoTournament(tournament, this.calcMontepremi(), tournament.buyin, subscribedElite, mainTextColor, infoText, this.props.history)}

                {this.renderButtonShowResults()}

                <div style={{ width: boxW, flexWrap: 'wrap' }}>
                    {matchPair.map((item, index) => {
                        return boxPairTournament(item, index, userMinted, mainTextColor, subscribed, this.props.history, isDarkmode, rankings)
                    })}
                </div>
            </div>
        )
    }

    renderRoundConcluso(boxW, isMobile, padding) {
        const { tournament, subscribed, yourStat, showWizardsIn } = this.state
        const { mainTextColor, subscribedElite } = this.props

        if (!subscribed || subscribed.length === 0) {
            return this.renderLoading()
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

        const subtitleText = `The ${subscribed.length} winners of ${roundEnded} medals:`

        let titleText = tournament.tournamentEnd ?
                        "The tournament is over! Let's see who the winners are"
                        :
                        `${text}. Partial results of this tournament (round ${roundEnded}/${tournament.nRounds} concluded)`


        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                {this.renderLoading()}

                {renderInfoTournament(tournament, this.calcMontepremi(), tournament.buyin, subscribedElite, mainTextColor, titleText, this.props.history)}

                {
                    yourStat && showWizardsIn ?
                    <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 20, textAlign: 'center' }}>
                        {yourStat}
                    </p>
                    :
                    <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <p style={{ fontSize: 17, color: mainTextColor, marginRight: 7 }}>
                            Your winning wizards
                        </p>

                        <button
                            style={{ marginTop: 3 }}
                            onClick={() => this.setState({ showWizardsIn: true })}
                        >
                            <MdRemoveRedEye
                                color={mainTextColor}
                                size={22}
                            />
                        </button>
                    </div>
                }

                {this.renderButtonShowResults()}

                <div style={{ flexDirection: 'column', marginBottom: 60, alignItems: 'center' }}>
                    <div style={Object.assign({}, styles.boxPodio, { borderColor: '#CD7F32' })}>
                        <p style={{ fontSize: 18, color: mainTextColor }} className="text-bold">
                            {subtitleText}
                        </p>
                    </div>

                    <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                        {subscribed.map((item, index) => {
                            return this.renderRow(item, index, 260);
                        })}
                    </div>
                </div>

            </div>
        )
    }

    renderButtonShowResults() {
        const { mainTextColor, history } = this.props
        const { tournament, userMinted } = this.state

        return (
            <div style={{ alignItems: 'center', flexDirection: 'column' }}>
                <button
                    className='btnH'
                    style={styles.btnSubscribe}
                    onClick={() => this.setState({ showProfileFights: true })}
                >
                    <p style={{ fontSize: 16, color: 'white' }} className="text-medium">
                        Show your results
                    </p>
                </button>

                {
                    this.state.showProfileFights &&
                    <div style={{ width: "100%" }}>
                        <BoxYourResults
                            tournament={tournament}
                            mainTextColor={mainTextColor}
                            history={history}
                            userMintedNfts={userMinted}
                        />
                    </div>
                }
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
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
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
        borderWidth: 2,
        borderRadius: 4,
        borderStyle: 'solid',
        marginBottom: 15,
        width: "fit-content"
    },
    btnRules: {
        width: 100,
        height: 32,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    boxPair: {
        alignItems: 'center',
        padding: 7,
        borderWidth: 2,
        borderColor: 'white',
        borderStyle: 'solid',
        borderRadius: 2,
        marginRight: 15,
        marginBottom: 15
    },
    btnRanking: {
        marginLeft: 20,
        borderRadius: 2,
        width: 150,
        height: 40,
        cursor: 'pointer',
        backgroundColor: CTA_COLOR,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, subscribedElite, subscribedEliteSpellGraph, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, subscribedElite, subscribedEliteSpellGraph, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    getBuyin,
    getFeeTournament,
    setNetworkSettings,
    setNetworkUrl,
    getSubscribed,
    loadUserMintedNfts,
    getPotionEquippedMass,
    getInfoItemEquippedMass,
    getCountForTournament
})(TournamentElite)
