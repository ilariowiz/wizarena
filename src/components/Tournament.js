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
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import convertMedalName from './common/ConvertMedalName'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
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
                name: "t7_r1",
                roundEnded: "0",
                showPair: true,
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
        const { subscribed, subscribedKdaSpellGraph } = this.props

        let number = 0
        let pct = 0

        if (subscribedKdaSpellGraph[name]) {
            number = subscribedKdaSpellGraph[name]
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
            <div style={{ flexDirection: 'column', marginBottom: 20 }}>
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

                <div style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    {this.renderSingleGraph('#88f71e', 'Acid')}
                    {this.renderSingleGraph('#5b30b7', 'Dark')}
                    {this.renderSingleGraph('#503631', 'Earth')}
                    {this.renderSingleGraph('#cc1919', 'Fire')}
                    {this.renderSingleGraph('#11c8ee', 'Ice')}
                    {this.renderSingleGraph('#840fb2', 'Psycho')}
                    {this.renderSingleGraph('#b2e5ef', 'Spirit')}
                    {this.renderSingleGraph('#faf000', 'Sun')}
                    {this.renderSingleGraph('#e6dc0c', 'Thunder')}
                    {this.renderSingleGraph('#4b0082', 'Undead')}
                    {this.renderSingleGraph('#15a3c7', 'Water')}
                    {this.renderSingleGraph('#afb9cc', 'Wind')}
                </div>
            </div>
        )
    }

    renderHeaderLeague() {
        const { tournament } = this.state

        return (
            <div style={{ alignItems: 'center', marginBottom: 40 }}>

                <div style={{ flexDirection: 'column' }}>

                    <div style={{ alignItems: 'center', marginBottom: 10 }}>
                        <p style={{ fontSize: 30, color: 'white', marginRight: 15 }}>
                            The Twelve League
                        </p>

                        <p style={{ fontSize: 17, color: 'white', marginTop: 2 }}>
                            ({tournament.leagueTournament})
                        </p>
                    </div>

                    <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>

                        <div style={{ alignItems: 'center', marginRight: 20 }}>
                            <p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
                                Region:
                            </p>
                            <Popup
        						trigger={open => (
                                    <p style={{ textDecoration: "underline", fontSize: 20, color: 'white', cursor: 'pointer' }}>
                                        {tournament.region}
                                    </p>
        						)}
        						position="bottom center"
        						on="hover"
        					>
        						<div style={{ padding: 10 }}>
        							<p style={{ fontSize: 17, color: 'black', lineHeight: 1.2 }}>
                                        {tournament.regionDescription}
                                    </p>
        						</div>
        					</Popup>
                        </div>

                        <div style={{ alignItems: 'center', marginRight: 20 }}>
                            <p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
                                Event:
                            </p>
                            <Popup
        						trigger={open => (
                                    <p style={{ textDecoration: "underline", fontSize: 20, color: 'white', cursor: 'pointer' }}>
                                        {tournament.event}
                                    </p>
        						)}
        						position="bottom center"
        						on="hover"
        					>
        						<div style={{ padding: 10 }}>
        							<p style={{ fontSize: 17, color: 'black', lineHeight: 1.2 }}>
                                        {tournament.eventDescription}
                                    </p>
        						</div>
        					</Popup>
                        </div>
                    </div>

                </div>

                <a
                    className="btnH"
                    href={`${window.location.protocol}//${window.location.host}/league`}
                    style={styles.btnRanking}
                    onClick={(e) => {
                        e.preventDefault()
                        this.props.history.push(`./league`)
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        RANKING
                    </p>
                </a>
            </div>
        )
    }

    renderBody(isMobile) {
        const { tournament } = this.state
        const { buyin, subscribed } = this.props

        //console.log(buyin);

        const { boxW } = getBoxWidth(isMobile)

        if (this.state.loading) {
            return (
                <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>
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

            const dateStart = moment(tournament.start.seconds * 1000)
            //console.log(dateStart);

            const dateStartString = moment(dateStart).format("dddd, MMMM Do YYYY, h:mm:ss a");
            const dateStartTo = moment().to(dateStart)

			return (
				<div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflowY: 'auto', overflowX: 'hidden' }}>

                    {
                        tournament.showLeague ?
                        this.renderHeaderLeague()
                        :
                        <p style={{ fontSize: 30, color: 'white', marginBottom: 20 }}>
                            The Weekly Tournament
                        </p>
                    }

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
            					Participation reward (for each wizard) {tournament.reward}
            				</p>
						</div>

						{this.renderInfoTournament(boxW)}
					</div>


					<button
                        className='btnH'
                        style={styles.btnSubscribe}
                        onClick={() => this.props.history.replace('/tournaments')}
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
				text = `The round ${roundValue} will start ${start.fromNow()}`
			}
			else {
				text = `The tournament started ${start.fromNow()}`
			}

			return (
				<div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflowY: 'auto', overflowX: 'hidden' }}>

                    {
                        tournament.showLeague ?
                        this.renderHeaderLeague()
                        :
                        <p style={{ fontSize: 30, color: 'white', marginBottom: 20 }}>
                            The Weekly Tournament
                        </p>
                    }

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

                    {
                        subscribed && subscribed.length > 0 &&
                        this.renderGraph()
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
            return this.renderMatchPair(boxW, isMobile)
        }

        return this.renderRoundConcluso(boxW, isMobile)
    }

    renderMatchPair(boxW, isMobile) {
        const { matchPair, tournament } = this.state

        const roundName = tournament.name.split("_")[1]

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflowY: 'auto', overflowX: 'hidden' }}>

                {
                    tournament.showLeague ?
                    this.renderHeaderLeague()
                    :
                    <p style={{ fontSize: 30, color: 'white', marginBottom: 20 }}>
                        The Weekly Tournament
                    </p>
                }

                <div style={{ justifyContent: 'space-between', marginBottom: 30 }}>

                    <div style={{ flexDirection: 'column', width: '100%', justifyContent: 'flex-end' }}>
                        <p style={{ fontSize: 24, color: 'white' }}>
                            Pairings of round {roundName.replace("r", "")}
                        </p>
                    </div>

                    {this.renderInfoTournament(boxW)}

                </div>

                <div style={{ width: boxW, flexWrap: 'wrap' }}>
                    {matchPair.map((item, index) => {
                        return this.renderBoxPair(item, index)
                    })}
                </div>
            </div>
        )
    }

    renderBoxPair(item, index) {
        const { userMinted } = this.state

        //console.log(userMinted);

        let is1mine = false
        let is2mine = false
        let borderColor = 'white'

        for (let i = 0; i < userMinted.length; i++) {
            const s = userMinted[i]

            if (s.id === item.s1.id) {
                is1mine = true
                borderColor = 'gold'
            }

            if (item.s2 && item.s2.id && s.id === item.s2.id) {
                is2mine = true
                borderColor = 'gold'
            }
        }

        const widthImage = 120

        return (
            <div
                style={Object.assign({}, styles.boxPair, { borderColor } )}
                key={index}
            >
                <div style={{ flexDirection: 'column', alignItems: 'center', marginRight: 5 }}>
                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.s1.id}`}
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push(`/nft/${item.s1.id}`)
                        }}
                    >
                        <img
                            style={{ width: widthImage, height: widthImage, borderRadius: 2, borderWidth: 1, borderColor: is1mine ? 'gold' : 'white', borderStyle: 'solid', marginBottom: 4 }}
                            src={getImageUrl(item.s1.id)}
                            alt={`#${item.s1.id}`}
                        />
                    </a>

                    <p style={{ fontSize: 20, color: is1mine ? 'gold' : 'white' }}>
                        #{item.s1.id}
                    </p>
                </div>

                <p style={{ fontSize: 21, color: 'white', marginRight: 5 }}>
                    VS
                </p>

                {
                    item.s2 && item.s2.id ?
                    <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                        <a
                            href={`${window.location.protocol}//${window.location.host}/nft/${item.s2.id}`}
                            onClick={(e) => {
                                e.preventDefault()
                                this.props.history.push(`/nft/${item.s2.id}`)
                            }}
                        >
                            <img
                                style={{ width: widthImage, height: widthImage, borderRadius: 2, borderWidth: 1, borderColor: is2mine ? 'gold' : 'white', borderStyle: 'solid', marginBottom: 4 }}
                                src={getImageUrl(item.s2.id)}
                                alt={`#${item.s2.id}`}
                            />
                        </a>

                        <p style={{ fontSize: 20, color: is2mine ? 'gold' : 'white' }}>
                            #{item.s2.id}
                        </p>
                    </div>
                    :
                    <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                        <div style={{ width: widthImage, height: widthImage, marginBottom: 4 }}>
                        </div>

                        <p style={{ fontSize: 15, color: 'white' }}>
                            Opponent disappeared
                        </p>
                    </div>
                }
            </div>
        )
    }

    renderRoundConcluso(boxW, isMobile) {
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
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflowY: 'auto', overflowX: 'hidden' }}>

                {
                    tournament.showLeague ?
                    this.renderHeaderLeague()
                    :
                    <p style={{ fontSize: 30, color: 'white', marginBottom: 20 }}>
                        The Weekly Tournament
                    </p>
                }

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
			<div>
                <Header
                    page='nft'
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
					query="(max-width: 1199px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1200px)"
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
		flexDirection: 'row',
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
        minHeight: 50,
        marginBottom: 20,
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
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, montepremi, buyin, feeTournament, subscribed, subscribedKdaSpellGraph } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, showModalTx, montepremi, buyin, feeTournament, subscribed, subscribedKdaSpellGraph };
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
