import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { getDocs, collection, query, doc, where, getDoc } from "firebase/firestore";
import { firebasedb } from './Firebase';
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios'
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import toast, { Toaster } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa6'
import { CgArrowTopRightR } from 'react-icons/cg'
import { MdOutlineDateRange } from 'react-icons/md'
import getBoxWidth from './common/GetBoxW'
import regionPerElement from './common/LordsRegionsElement'
import getImageUrl from './common/GetImageUrl'
import NftCardChoice from './common/NftCardChoice'
import ModalLoadingFight from './common/ModalLoadingFight'
import getLoadingFightText from './common/LoadingFightText'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import 'reactjs-popup/dist/index.css';
import {
    setNetworkSettings,
    setNetworkUrl,
    getConquestSubscribersIdsPerSeason,
    loadUserMintedNfts,
    updateInfoTransactionModal,
    subscribeToLords,
    loadBlockNftsSplit,
    signFightTransaction
} from '../actions'
import {ReactComponent as VedrenonIcon} from '../assets/regions/svg/vedrenon.svg'
import {ReactComponent as WastiaxusIcon} from '../assets/regions/svg/wastiaxus.svg'
import {ReactComponent as UlanaraIcon} from '../assets/regions/svg/ulanara.svg'
import {ReactComponent as UlidalarIcon} from '../assets/regions/svg/ulidalar.svg'
import {ReactComponent as SitenorIcon} from '../assets/regions/svg/sitenor.svg'
import {ReactComponent as OceorahIcon} from '../assets/regions/svg/oceorah.svg'
import {ReactComponent as DruggorialIcon} from '../assets/regions/svg/druggorial.svg'
import {ReactComponent as OpherusIcon} from '../assets/regions/svg/opherus.svg'
import {ReactComponent as BremononIcon} from '../assets/regions/svg/bremonon.svg'


const sitenorImg = require('../assets/regions/sitenor.png')
const druggorialImg = require('../assets/regions/druggorial.png')
const vedrenonImg = require('../assets/regions/vedrenon.png')
const oceorahImg = require('../assets/regions/oceorah.png')
const opherusImg = require('../assets/regions/opherus.png')
const ulidalarImg = require('../assets/regions/ulidalar.png')
const wastiaxusImg = require('../assets/regions/wastiaxus.png')
const ulanaraImg = require('../assets/regions/ulanara.png')
const bremononImg = require('../assets/regions/bremonon.png')

const placeholderWiz = require('../assets/placeholder.png')


class Conquest extends Component {
    constructor(props) {
        super(props)

        this.SEASON_NAME = ""
        this.SEASON_ID = ""
        this.SEASON_ID_FIGHTS = ""

        this.startedFight = false

        this.state = {
            seasonInfo: {},
            loadingYourSubs: true,
            loadingChampions: true,
            subscribersId: [],
            wizardSelected: {},
            wizardSelectedElos: {},
            wizardSelectedLastFights: [],
            yourSubs: [],
            champions: {},
            fightsDone: 0,
            loadingYourChampion: false,
            showSubscribe: false,
            notSubbed: [],
            toSubscribe: [],
            countSubbedWizards: 0,
            infoLords: {},
            signedCmd: undefined,
            showModalLoadingFight: false,
            textLoadingFight: "",
            fightId: "",
            opponentId: ""
        }
    }

    async componentDidMount() {
		document.title = "Lords Season - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        const seasonInfo = await this.loadInfoSeason()
        this.SEASON_NAME = seasonInfo.seasonName
        this.SEASON_ID = seasonInfo.seasonId
        this.SEASON_ID_FIGHTS = seasonInfo.seasonIdFights

        this.setState({ seasonInfo })

        setTimeout(() => {
            this.loadMinted()
            this.loadChampions()
        }, 500)
	}

    async loadInfoSeason() {
        const docRef = doc(firebasedb, "season_info", 'main')

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

        //console.log(data);

        return data
    }

    async loadChampions() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.setState({ loadingChampions: true })

        let allData = []
        let champions = {}
        const idsToLoad = []

        const q = query(collection(firebasedb, this.SEASON_ID))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
            const d = doc.data()
            //console.log(d);
            let champion = {}

            champion = d
            champion['docId'] = doc.id

            allData.push(champion)
        })

        //console.log(allData);

        allData.sort((a, b) => {
            return b["eloSitenor"] - a["eloSitenor"]
        })

        const sitenorChampion = allData.slice(0, 3)
        champions['Sitenor'] = sitenorChampion
        sitenorChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloDruggorial"] - a["eloDruggorial"]
        })

        const druggorialChampion = allData.slice(0, 3)
        champions['Druggorial'] = druggorialChampion
        druggorialChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloVedrenon"] - a["eloVedrenon"]
        })

        const vedrenonChampion = allData.slice(0, 3)
        champions['Vedrenon'] = vedrenonChampion
        vedrenonChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloOceorah"] - a["eloOceorah"]
        })

        const oceorahChampion = allData.slice(0, 3)
        champions['Oceorah'] = oceorahChampion
        oceorahChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloOpherus"] - a["eloOpherus"]
        })

        const opherusChampion = allData.slice(0, 3)
        champions['Opherus'] = opherusChampion
        opherusChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloUlidalar"] - a["eloUlidalar"]
        })

        const ulidalarChampion = allData.slice(0, 3)
        champions['Ulidalar'] = ulidalarChampion
        ulidalarChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloWastiaxus"] - a["eloWastiaxus"]
        })

        const wastiaxusChampion = allData.slice(0, 3)
        champions['Wastiaxus'] = wastiaxusChampion
        wastiaxusChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloUlanara"] - a["eloUlanara"]
        })

        const ulanaraChampion = allData.slice(0, 3)
        champions['Ulanara'] = ulanaraChampion
        ulanaraChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        allData.sort((a, b) => {
            return b["eloBremonon"] - a["eloBremonon"]
        })

        const bremononChampion = allData.slice(0, 3)
        champions['Bremonon'] = bremononChampion
        bremononChampion.map(i => {
            if (!idsToLoad.includes(i.idnft)) {
                idsToLoad.push(i.idnft)
            }
        })

        let infoLords = {}

        if (idsToLoad.length > 1) {
            const infoLordsArray = await this.props.loadBlockNftsSplit(chainId, gasPrice, gasLimit, networkUrl, idsToLoad)

            infoLordsArray.map(i => {
                infoLords[i.id] = i
            })
        }

        //console.log(champions);

        //console.log(infoLords);

        this.setState({ champions, loadingChampions: false, infoLords })
    }

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {

            this.setState({ loadingYourSubs: true })

			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
				//console.log(response);
				this.getSubscribers()
			})
		}
        else {
            this.setState({ loadingYourSubs: false })
            this.getSubscribers()
        }
	}

    async getSubscribers() {
        const { chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props
        const { seasonInfo } = this.state

        let subscribersId = await this.props.getConquestSubscribersIdsPerSeason(chainId, gasPrice, gasLimit, networkUrl, this.SEASON_ID)

        //console.log(subscribersId);

        ////// TEST
        //subscribersId = ["396", "777", "2121", "2022", "1455", "183", "2999"]

        let onlySubsIds = []
        subscribersId.map(i => {
            onlySubsIds.push(i.idnft)
        })

        let yourSubs = []
        let notSubbed = []

        if (userMintedNfts) {

            for (let i = 0; i < userMintedNfts.length; i++) {
                const item = userMintedNfts[i]

                if (item.level >= seasonInfo.minLevel) {

                    if (onlySubsIds.includes(item.id)) {
                        const data = await this.getElosDataSingleNft(item.id)
                        item['fightsDone'] = data ? data.fightsDone : 0
                        item['synced'] = data ? true : false

                        //console.log(data);

                        yourSubs.push(item)
                    }
                    else {
                        notSubbed.push(item)
                    }
                }
            }
        }

        this.setState({ loadingYourSubs: false, yourSubs, notSubbed, countSubbedWizards: subscribersId.length })
	}

    async loadYourChampion(infoNft) {
        this.setState({ loadingYourChampion: true })

        const data = await this.getElosDataSingleNft(infoNft.id)

        //console.log(data);
        this.setState({ wizardSelectedElos: data, wizardSelected: infoNft, fightsDone: data.fightsDone, loadingYourChampion: false, signedCmd: undefined }, () => {
            this.loadWizardSelectedLastFights(infoNft.id)
        })
    }

    async getElosDataSingleNft(idnft) {

        const q = query(collection(firebasedb, this.SEASON_ID), where("idnft", "==", idnft))
        const querySnapshot = await getDocs(q)

        let data = undefined

        querySnapshot.forEach(doc => {
            data = doc.data()
            data['docId'] = doc.id
        })

        return data
    }

    async addToSubscribers(id) {
        const { toSubscribe } = this.state

        const newToSub = Object.assign([], toSubscribe)
        newToSub.push(id)

        this.setState({ toSubscribe: newToSub })
    }

    subscribeWizards() {
        const { chainId, gasPrice, gasLimit, netId, account } = this.props
        const { toSubscribe, seasonInfo } = this.state

        //console.log(toSubscribe);
        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${toSubscribe.length * seasonInfo.buyin} $KDA`,
			typeModal: 'subscribe_lords',
			transactionOkText: `Your Wizards are registered for Lords of Wizards World - ${this.SEASON_NAME}!`
		})

        const totKda = _.round(toSubscribe.length * seasonInfo.buyin, 2)

        this.props.subscribeToLords(chainId, gasPrice, gasLimit, netId, account, this.SEASON_ID, toSubscribe, totKda)
    }

    async loadWizardSelectedLastFights(idnft) {
        let q1 = query(collection(firebasedb, this.SEASON_ID_FIGHTS), where("wizards", "array-contains-any", [idnft]))
        const querySnapshot = await getDocs(q1)

        let fights = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
            let data = doc.data()
            data['docId'] = doc.id

            fights.push(data)
        })

        //console.log(fights);
        fights = fights.sort((a, b) => {
            const timeA = moment(a.timestamp.seconds * 1000)
            const timeB = moment(b.timestamp.seconds * 1000)

            return timeB - timeA
        })

        fights = fights.slice(0, 5)

        this.setState({ wizardSelectedLastFights: fights })
    }

    async startFight(regionName) {
        const { account, chainId, gasPrice, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient } = this.props
        const { signedCmd } = this.state

        let seasonEnded = this.checkSeasonEnded()
        //console.log(seasonEnded);
        if (seasonEnded) {
            //season finita mentre stavi ancora con la pagina aperta e ti fa fare i fights
            window.location.reload()
            return
        }

        if (!signedCmd) {
            this.setState({ showModalLoadingFight: true, textLoadingFight: "Sign the transaction to make the fight...", fightId: "", opponentId: "" })

            this.props.signFightTransaction(gasPrice, chainId, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, networkUrl, account, async (response) => {
                //console.log(response);
                if (response.error) {
                    this.setState({ showModalLoadingFight: false, textLoadingFight: "", fightId: "", opponentId: "" }, () => {
                        this.startedFight = false
                        setTimeout(() => {
                            toast.error(`Can't sign the transaction. Please retry`)
                        }, 1000)
                    })
                    return
                }

                this.setState({ signedCmd: response }, () => {
                    this.askForFight(regionName)
                })
            })
        }
        else {
            this.askForFight(regionName)
        }
    }

    async askForFight(region) {
        const { signedCmd, wizardSelected } = this.state

        this.setState({ showModalLoadingFight: true, textLoadingFight: getLoadingFightText(), fightId: "", opponentId: "" })

        try {
            const responseFight = await axios.post('https://wizards-bot.herokuapp.com/fight', {
                id: wizardSelected.id,
                mode: "lords",
                region,
                signedCmd
            })

            //console.log(responseFight);

            if (responseFight.status === 200) {
                this.handleResponseFight(responseFight.data)
            }
            else {
                this.hideLoadingFightWithError(`Something goes wrong. Please retry`)
            }
        }
        catch(error) {
            this.hideLoadingFightWithError(`Something goes wrong. Please retry`)
        }
    }

    async handleResponseFight(response) {

        this.startedFight = false

        if (response.error) {

            const error = response.error
            if (error === "invalid") {
                this.setState({ signedCmd: undefined }, () => {
                    this.hideLoadingFightWithError(`Invalid request. Please sign the transaction.`)
                })
            }
            else if (error === "no_fights_left") {
                this.hideLoadingFightWithError("This wizard cannot do other fights")
            }
            else if (error === "no_opponent") {
                this.hideLoadingFightWithError("There are no opponents available")
            }
            else if (error === "no_owner") {
                this.hideLoadingFightWithError("You are not the owner of this wizard")
            }
            else if (error === "season_ended") {
                this.hideLoadingFightWithError("The season is ended")
            }
            else if (error === "invalid_region") {
                this.hideLoadingFightWithError("This wizard cannot fight in this region")
            }
        }
        //SUCCESS
        else {
            const { wizardSelected } = this.state

            this.loadChampions()
            this.loadWizardSelectedLastFights(wizardSelected.id)
            const dataElo = await this.getElosDataSingleNft(wizardSelected.id)

            this.setState({ opponentId: response.opponentId }, () => {
                setTimeout(() => {
                    this.setState({ textLoadingFight: "Fight done!", fightId: response.success, fightsDone: dataElo.fightsDone, wizardSelectedElos: dataElo })
                }, 1500)
            })
        }
    }

    hideLoadingFightWithError(error) {
        this.setState({ showModalLoadingFight: false }, () => {
            this.startedFight = false
            setTimeout(() => {
                toast.error(error)
            }, 1000)
        })
    }

    eventsPerRegion(regionName) {

        let events = []

        for (const [key, value] of Object.entries(regionPerElement)) {
            if (value.includes(regionName)) {
                events.push(key)
            }
        }
        return events.sort()
    }

    renderFooterSubscribe(isMobile) {
		const { toSubscribe } = this.state
        const { account } = this.props

		let temp = []
		toSubscribe.map(i => {
			temp.push(
                <img
                    key={i}
                    style={{ width: 60, height: 60, borderRadius: 4, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', cursor: 'pointer' }}
                    src={getImageUrl(i)}
                    alt={`#${i}`}
                />
			)
		})

		const styleBox = isMobile ?
						{ flexDirection: 'column', alignItems: 'center', paddingBottom: 10, width: '100%' }
						:
						{ justifyContent: 'space-between', alignItems: 'center', flex: 1 }

		return (
			<div style={styleBox}>
				<div style={{ flexWrap: 'wrap', marginLeft: isMobile ? 0 : 20 }}>
					{temp}
				</div>

				<button
					className="btnH"
					style={{ width: 180, height: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: CTA_COLOR, marginRight: 20 }}
					onClick={() => this.subscribeWizards()}
				>
					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
						Subscribe
					</p>

                    <p style={{ fontSize: 13, color: 'white', marginTop: 3 }}>
                        Balance: {_.floor(account.balance, 1)} $KDA
                    </p>

				</button>
			</div>
		)
	}

    renderRowChoise(item, index) {
		const { toSubscribe } = this.state

        return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
				onSubscribe={(id) => {
                    if (!toSubscribe.includes(id)) {
                        this.addToSubscribers(id)
                    }
                    else {
                        const toSubscribeCopy = Object.assign([], toSubscribe)
                        const idx = toSubscribeCopy.findIndex(i => i === id)
                        toSubscribeCopy.splice(idx, 1)

                        this.setState({ toSubscribe: toSubscribeCopy })
                    }
                }}
				modalWidth={230}
				section={"lords"}

			/>
		)
	}

    showInfoLord(info) {
        return (
            <div style={{ flexDirection: 'column' }}>
                <p style={{ fontSize: 16, color: 'black', marginBottom: 7 }}>
                    Element {info.element.toUpperCase()}
                </p>
                <p style={{ fontSize: 16, color: 'black', marginBottom: 7 }}>
                    Resistance {info.resistance.toUpperCase()}
                </p>
                <p style={{ fontSize: 16, color: 'black', marginBottom: 7 }}>
                    Weakness {info.weakness.toUpperCase()}
                </p>
            </div>
        )
    }

    renderSingleNft(champion, keyElo) {

        const { infoLords } = this.state

        //console.log(champion);

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Popup
                    trigger={open => (
                        <a
                            href={champion && parseInt(champion.idnft) < 10000 ? `${window.location.protocol}//${window.location.host}/nft/${champion.idnft}` : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ cursor: 'pointer', borderRadius: 50 }}
                        >
                            <img
                                style={{ width: 100, height: 100, backgroundColor: "#ffffff30", borderRadius: 50 }}
                                src={champion && champion.idnft && parseInt(champion.idnft) < 10000 ? `https://storage.googleapis.com/wizarena/wizards_nobg/${champion.idnft}.png` : placeholderWiz}
                                alt={champion ? `#${champion.idnft}` : '...'}
                            />
                        </a>
                    )}
                    position="top center"
                    on="hover"
                >
                    {
                        champion && parseInt(champion.idnft) < 10000 && infoLords[champion.idnft] ?
                        this.showInfoLord(infoLords[champion.idnft])
                        : '...'
                    }
                </Popup>

                <div style={{ alignItems: 'center', justifyContent: 'center', height: 22, width: 100, backgroundColor: "#090606", borderRadius: 4, marginBottom: 10 }}>
                    <p style={{ color: "#d5d4ce", fontSize: 14, textAlign: 'center' }} className="text-bold">
                        ELO {champion && parseInt(champion.idnft) < 10000 ? champion[keyElo] : "..."}
                    </p>
                </div>
            </div>
        )
    }

    canFightInRegion(wizardElement, events) {
        //console.log(events, wizardElement);
        if (events.includes(wizardElement)) {
            return true
        }

        return false
    }

    renderRegion(regionName, regionImage, RegionIcon, keyElo, seasonStarted, seasonEnded) {

        const { wizardSelected, wizardSelectedElos, champions, fightsDone, infoLords } = this.state
        const { mainTextColor } = this.props

        const possibleBoosts = this.eventsPerRegion(regionName)

        //console.log(infoLords);

        //console.log(champions[regionName], regionName);
        let champion, second, third;

        if (champions && champions[regionName]) {
            champion = champions[regionName].length > 0 ? champions[regionName][0] : undefined
            second = champions[regionName].length > 1 ? champions[regionName][1] : undefined
            third = champions[regionName].length > 2 ? champions[regionName][2] : undefined
        }

        if (!champion) {
            return undefined
        }

        let championName;
        if (infoLords && infoLords[champion.idnft]) {
            championName = infoLords[champion.idnft].nickname ? `#${infoLords[champion.idnft].id} ${infoLords[champion.idnft].nickname}` : `#${infoLords[champion.idnft].id}`
        }

        const fightsLeft = 5 - fightsDone

        const oldElo = wizardSelectedElos[keyElo] - wizardSelectedElos[`old${keyElo}`]

        const maxWidth = 210

        //console.log(champion);

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', paddingLeft: 15, paddingRight: 15, position: 'relative', marginRight: 20, marginBottom: 20 }}>

                <div style={{ alignItems: 'center', marginTop: 5, marginBottom: 10, justifyContent: 'center', flexDirection: 'column', zIndex: 100, width: '100%' }}>

                    <RegionIcon width={36} height={36} color={mainTextColor} />

                    <p style={{ fontSize: 16, color: mainTextColor, marginTop: 5 }} className="text-medium">
                        {regionName.toUpperCase()}
                    </p>

                    {
                        wizardSelected && wizardSelectedElos && wizardSelectedElos.idnft &&
                        <div style={{ flexDirection: 'row', alignItems: 'center' }}>

                            <FaStar
                                color={mainTextColor}
                                size={14}
                            />

                            <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center', marginRight: 5, marginLeft: 3 }}>
                                your ELO
                            </p>

                            <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                {wizardSelectedElos[keyElo]}
                            </p>

                            <p style={{ fontSize: 12, color: mainTextColor, marginLeft: 3 }} className="text-light">
                                ({oldElo > 0 ? "+" : ""}{oldElo})
                            </p>
                        </div>
                    }
                </div>


                <div style={{ alignItems: 'center', flexDirection: 'column', zIndex: 100 }}>

                    <p style={{ color: mainTextColor, fontSize: 15, textAlign: 'center', marginBottom: 5, maxWidth: 180, height: 36 }} className="text-bold">
                        LORD {championName}
                    </p>

                    {this.renderSingleNft(champion, keyElo)}

                    <div style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        {this.renderSingleNft(second, keyElo)}

                        <div style={{ width: 20, height: 1 }} />

                        {this.renderSingleNft(third, keyElo)}
                    </div>

                    <div style={{ marginBottom: 3, alignItems: 'center' }}>
                        <CgArrowTopRightR
                            color={mainTextColor}
                            size={18}
                        />

                        <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center', marginLeft: 3 }}>
                            Possible boosts
                        </p>
                    </div>

                    <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center', marginBottom: 10 }} className="text-bold">
                        {possibleBoosts.join(", ")}
                    </p>

                    {
                        !seasonStarted && !seasonEnded &&
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginBottom: 15 }}>
                            Season hasn't started yet
                        </p>
                    }

                    {
                        seasonEnded &&
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginBottom: 15 }}>
                            Season is over! Congrats all
                        </p>
                    }

                    {
                        (!wizardSelected || !wizardSelected.id) && seasonStarted && !seasonEnded &&
                        <p style={{ fontSize: 17, color: mainTextColor, textAlign: 'center', marginBottom: 15 }}>
                            Select a wizard
                        </p>
                    }

                    {
                        wizardSelected && wizardSelectedElos && wizardSelectedElos.idnft && wizardSelectedElos.idnft !== champion.idnft && seasonStarted && !seasonEnded ?
                        <div style={{ flexDirection: 'column', alignItems: 'center' }}>

                            {
                                fightsLeft > 0 && this.canFightInRegion(wizardSelected.element, possibleBoosts) &&
                                <button
                                    style={Object.assign({}, styles.btnSubscribe, { width: maxWidth, height: 30, marginBottom: 8, boxShadow: "black 0px 0px 15px", })}
                                    onClick={() => {
                                        if (!this.startedFight) {
                                            this.startedFight = true
                                            this.startFight(regionName)
                                        }
                                    }}
                                >
                                    <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                        Fight
                                    </p>
                                </button>
                            }

                            {
                                fightsLeft <= 0 &&
                                <div
                                    style={Object.assign({}, styles.btnSubscribe, { width: maxWidth, height: 30, marginBottom: 8, cursor: 'default' })}
                                >
                                    <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                        No fights left
                                    </p>
                                </div>
                            }
                        </div>
                        : undefined
                    }

                    {
                        wizardSelected && wizardSelectedElos && wizardSelectedElos.idnft && wizardSelectedElos.idnft === champion.idnft ?
                        <div style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center', maxWidth }} className="text-bold">
                                You are currently the Lord of the region
                            </p>
                        </div>
                        : undefined
                    }

                </div>

                <img
                    src={regionImage}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 90, opacity: '0.1' }}
                    alt={regionName}
                />

            </div>
        )
    }

    renderYourSubs(item, index) {
        const { mainTextColor } = this.props
        const { loadingYourChampion } = this.state

        const fightsLeft = 5 - item.fightsDone

        return (
            <div style={Object.assign({}, styles.yourSubCard, { maxWidth: 120 })} key={index}>
                <img
                    style={{ width: 120, height: 120, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                    src={getImageUrl(item.id)}
                    alt={`#${item.id}`}
                />

                <p style={{ color: mainTextColor, fontSize: 16, marginTop: 10, marginBottom: 10, textAlign: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    {item.name} {item.nickname || ""}
                </p>

                <p style={{ color: mainTextColor, fontSize: 15, marginTop: 10, marginBottom: 10, textAlign: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    Fights left {fightsLeft}
                </p>

                {
                    !loadingYourChampion ?
                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, borderTopLeftRadius: 0, borderTopRightRadius: 0 })}
                        onClick={() => {
                            if (item.synced) {
                                this.loadYourChampion(item)
                            }
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                            {item.synced ? 'Select' : 'Synchronizing...'}
                        </p>
                    </button>
                    :
                    <div
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, borderTopLeftRadius: 0, borderTopRightRadius: 0 })}
                    >
                        <DotLoader size={20} color={mainTextColor} />
                    </div>
                }
            </div>
        )
    }

    renderSingleFight(item, index) {
        const { wizardSelected } = this.state
        const { mainTextColor } = this.props

        //console.log(item);

        const otherWizardId = item.idnft1 === wizardSelected.id ? item.idnft2 : item.idnft1

        const otherWizardInfo = item.info1.id === otherWizardId ? item.info1 : item.info2

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', marginRight: 20, justifyContent: 'space-between' }} key={index}>
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${otherWizardId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        style={{ width: 100, height: 100, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid' }}
                        src={getImageUrl(otherWizardId)}
                        alt={`#${otherWizardId}`}
                    />
                </a>

                <p style={{ color: mainTextColor, fontSize: 13, marginTop: 5, marginBottom: 5, maxWidth: 100, textAlign: 'center' }}>
                    {otherWizardInfo.name} {otherWizardInfo.nickname}
                </p>

                <a
                    style={Object.assign({}, styles.btnSubscribe, { width: 100, height: 30, cursor: 'pointer' })}
                    href={`${window.location.protocol}//${window.location.host}/fightreplay/${this.SEASON_ID_FIGHTS}/${item.docId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                        Replay
                    </p>
                </a>
            </div>
        )
    }

    renderWizardSelected(isMobile) {
        const { mainTextColor } = this.props
        const { wizardSelected, fightsDone, wizardSelectedLastFights } = this.state

        return (
            <div style={{ flexDirection: isMobile ? 'column' : 'row', width: "100%" }}>

                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${wizardSelected.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            style={{ width: 220, height: 220, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid' }}
                            src={getImageUrl(wizardSelected.id)}
                            alt={`#${wizardSelected.id}`}
                        />
                    </a>

                    <p style={{ color: mainTextColor, fontSize: 18, marginTop: 10, marginBottom: 10, maxWidth: 220, textAlign: 'center' }} className="text-medium">
                        {wizardSelected.name} {wizardSelected.nickname}
                    </p>

                    <p style={{ fontSize: 20, color: CTA_COLOR, marginBottom: 10 }} className="text-bold">
                        Daily fights left {5 - fightsDone}
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 30 })}
                        onClick={() => this.setState({ wizardSelected: {}, wizardSelectedElos: {}, fightsDone: 0 })}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                            Change
                        </p>
                    </button>
                </div>

                <div style={{ flexDirection: 'column', marginLeft: 20 }}>
                    <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 10 }} className="text-medium">
                        Last fights
                    </p>

                    <div style={{ flexWrap: 'wrap' }}>
                        {
                            wizardSelectedLastFights.map((item, index) => {
                                return this.renderSingleFight(item, index)
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }

    checkSeasonEnded() {
        const { seasonInfo } = this.state

        let seasonEnded = false
        if (seasonInfo && seasonInfo.end) {
            const endSeason = moment(seasonInfo.end.seconds * 1000)
            if (endSeason < moment()) {
                seasonEnded = true
            }
        }

        return seasonEnded
    }

    calcTimeToResetFights() {
        const now = moment().utc()
        //console.log(now);
        let timeLeft = ""

        const deadline = now.clone().hour(15).minute(0).second(0)
        if (now.isAfter(deadline)) {
            let tomorrow = moment(new Date()).add(1, 'days').hour(15).minute(0).second(0)

            timeLeft = tomorrow.from(now)
            //console.log(tomorrow.from(now));
        }
        else {
            timeLeft = deadline.from(now)
            //console.log(deadline.from(now));
        }

        return timeLeft
    }

    renderBody(isMobile) {
        const { loadingYourSubs, loadingChampions, yourSubs, wizardSelected, showSubscribe, seasonInfo, notSubbed, countSubbedWizards } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        let boxCardSelected = boxW * 90 / 100
        if (boxCardSelected > 400) {
            boxCardSelected = 400
        }

        const insideWidth = boxW > 1250 ? 1250 : boxW

        let endSeasonText;
        let endLongText;
        let endSeason;
        let seasonEnded;
        if (seasonInfo && seasonInfo.end) {
            seasonEnded = this.checkSeasonEnded()
            endSeason = moment(seasonInfo.end.seconds * 1000)
            endSeasonText = moment().to(endSeason)
            endLongText = endSeason.format("DD/MM HH:mm")
        }

        //console.log(seasonEnded);

        let startSeasonText;
        let startLongText;
        let startSeason;
        let seasonStarted = false
        if (seasonInfo && seasonInfo.start) {
            startSeason = moment(seasonInfo.start.seconds * 1000)
            startSeasonText = moment().to(startSeason)
            startLongText = startSeason.format("DD/MM HH:mm")

            if (startSeason < moment()) {
                seasonStarted = true
            }
        }

        //console.log(seasonStarted);

        ///// PAGINA SUBSCRIBE ******************************
        if (showSubscribe && seasonInfo.start) {
            //console.log(startLongText);

            return (
                <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, paddingBottom: 0, overflowY: 'auto', overflowX: 'hidden' }}>

                    <div style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', width: '100%', marginBottom: 25 }}>
                        <p style={{ fontSize: 24, color: mainTextColor, marginBottom: isMobile ? 10 : 0 }} className="text-medium">
                            Lords of Wizards World - {this.SEASON_NAME}
                        </p>

                        <button
                            className='btnH'
                            style={styles.btnSubscribe}
                            onClick={() => {
                                this.setState({ showSubscribe: false })
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                Play
                            </p>
                        </button>
                    </div>

                    <div style={{ flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                            Buyin {seasonInfo.buyin} $KDA
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                            Min Level {seasonInfo.minLevel}
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                            Start {startSeasonText} ({startLongText})
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginRight: 20, marginBottom: 15 }}>
                            End {endSeasonText} ({endLongText})
                        </p>
                    </div>

                    <div style={{ flexWrap: 'wrap', overflowY: 'auto', overflowX: 'hidden', paddingBottom: 30 }}>
                    {
                        notSubbed && notSubbed.map((item, index) => {
                            return this.renderRowChoise(item, index)
                        })
                    }
                    </div>

                    {
                        this.state.toSubscribe.length > 0 &&
                        <div style={Object.assign({}, styles.footerSubscribe, { bottom: -padding, width: insideWidth, backgroundColor: mainBackgroundColor })}>
    						{this.renderFooterSubscribe(isMobile)}
    					</div>
                    }
                </div>
            )
        }

        //console.log(loadingYourSubs);

        ///// SECTION PLAY ******************************

        const timeToFightsReset = this.calcTimeToResetFights()


        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, overflowY: 'auto', overflowX: 'hidden' }}>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', width: '100%', marginBottom: 10 }}>
                    <p style={{ fontSize: 24, color: mainTextColor, marginBottom: isMobile ? 10 : 0 }} className="text-medium">
                        Lords of Wizards World - {this.SEASON_NAME}
                    </p>

                    <div style={{ flexDirection: 'column' }}>
                        <button
                            className='btnH'
                            style={Object.assign({}, styles.btnSubscribe, { marginBottom: 10 })}
                            onClick={() => {
                                this.setState({ showSubscribe: true })
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                Subscribe your wizards
                            </p>
                        </button>

                        <Popup
                            trigger={
                                <button
                                    className='btnH'
                                    style={styles.btnRules}
                                >
                                    <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                        Rules
                                    </p>
                                </button>
                            }
                            modal
                            nested
                        >
                            {close => (
                                <div style={{ flexDirection: 'column' }}>
                                    <div style={{ justifyContent: 'center', fontSize: 19, color: 'black', marginBottom: 10, marginTop: 5 }}>Rules</div>
                                    <div style={{ fontSize: 16, color: 'black', paddingLeft: 5, paddingRight: 5, marginBottom: 15 }}>
                                      {' '}
                                      Each region of Wizards World has its own leaderboard. Whoever has the most ELO points is the current Lord.
                                      <br />
                                      Each wizard has 5 daily fights and will be able to challenge one of the top 3 wizards of the regions that include his Element.
                                      <br />
                                      To calculate the ranking the website uses a modified version of the ELO rating. When you win, you gain points and your opponent loses 80% of the points you won.
                                      <br />
                                      <br />
                                      Each region has 3 possible boosts. These boosts are associated with the elements closest to the region, for example Sitenor can have Fire, Earth or Dark boost. Each fight will have a random boost chosen from the 3 possible elements in the region.
                                    </div>
                                    <div style={{ justifyContent: 'center', marginBottom: 10 }}>
                                        <button
                                            style={{ color: 'black', fontSize: 16 }}
                                            onClick={() => {
                                              close();
                                            }}
                                          >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Popup>
                    </div>
                </div>

                <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 25 }}>
                    {countSubbedWizards} participating Wizards
                </p>

                <div style={{ alignItems: 'center', marginBottom: 25, flexWrap: 'wrap' }}>
                    {
                        startSeasonText &&
                        <div style={{ alignItems: 'center', marginRight: 20 }}>

                            <MdOutlineDateRange
                                size={22}
                                color={mainTextColor}
                                style={{ marginRight: 3 }}
                            />

                            <p style={{ fontSize: 17, color: mainTextColor }}>
                                Start {startSeasonText} ({startLongText})
                            </p>
                        </div>
                    }

                    {
                        endSeasonText &&
                        <div style={{ alignItems: 'center' }}>

                            <MdOutlineDateRange
                                size={22}
                                color={mainTextColor}
                                style={{ marginRight: 3 }}
                            />

                            <p style={{ fontSize: 17, color: mainTextColor }}>
                                End {endSeasonText} ({endLongText})
                            </p>
                        </div>
                    }
                </div>

                {
                    wizardSelected && wizardSelected.id ?
                    this.renderWizardSelected(isMobile)
                    :
                    <div style={{ flexDirection: 'column' }}>
                        <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 10 }} className="text-medium">
                            Your subscribed Wizards
                        </p>

                        <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 10 }}>
                            Fights reset {timeToFightsReset}
                        </p>

                        {
        					loadingYourSubs ?
        					<div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
        						<DotLoader size={25} color={mainTextColor} />
        					</div>
        					: null
        				}

                        <div style={{ flexWrap: 'wrap' }}>
                            {
                                yourSubs && yourSubs.length > 0 && !loadingYourSubs &&
                                yourSubs.map((item, index) => {
                                    return this.renderYourSubs(item, index)
                                })
                            }
                        </div>

                        {
                            !loadingYourSubs && yourSubs && yourSubs.length === 0 &&
                            <p style={{ fontSize: 16, color: mainTextColor, marginTop: 10, marginBottom: 10 }} className="text-medium">
                                No Wizards subscribed...
                            </p>
                        }
                    </div>
                }

                <p style={{ marginTop: 20, marginBottom: 20, fontSize: 20, color: mainTextColor }}>
                    Regions of the Wizards World
                </p>

                {
                    loadingChampions &&
                    <div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
                }

                <div style={{ flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
                    {this.renderRegion("Sitenor", sitenorImg, SitenorIcon, "eloSitenor", seasonStarted, seasonEnded)}
                    {this.renderRegion("Druggorial", druggorialImg, DruggorialIcon, "eloDruggorial", seasonStarted, seasonEnded)}
                    {this.renderRegion("Vedrenon", vedrenonImg, VedrenonIcon, "eloVedrenon", seasonStarted, seasonEnded)}
                    {this.renderRegion("Oceorah", oceorahImg, OceorahIcon, "eloOceorah", seasonStarted, seasonEnded)}
                    {this.renderRegion("Opherus", opherusImg, OpherusIcon, "eloOpherus", seasonStarted, seasonEnded)}
                    {this.renderRegion("Ulidalar", ulidalarImg, UlidalarIcon, "eloUlidalar", seasonStarted, seasonEnded)}
                    {this.renderRegion("Wastiaxus", wastiaxusImg, WastiaxusIcon, "eloWastiaxus", seasonStarted, seasonEnded)}
                    {this.renderRegion("Ulanara", ulanaraImg, UlanaraIcon, "eloUlanara", seasonStarted, seasonEnded)}
                    {this.renderRegion("Bremonon", bremononImg, BremononIcon, "eloBremonon", seasonStarted, seasonEnded)}
                </div>

                {
                    this.state.showModalLoadingFight ?
                    <ModalLoadingFight
                        showModal={this.state.showModalLoadingFight}
                        onCloseModal={() => this.setState({ showModalLoadingFight: false })}
                        width={modalW}
                        text={this.state.textLoadingFight}
                        fightId={this.state.fightId}
                        refdb={this.SEASON_ID_FIGHTS}
                        opponentId={this.state.opponentId}
                        wizardSelectedId={this.state.wizardSelected.id}
                        isMobile={isMobile}
                    />
                    : undefined
                }

            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='nft'
					section={32}
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

                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

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
        width: 170,
		height: 40,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        display: 'flex',
        cursor: 'pointer'
	},
    btnRules: {
        width: 170,
		height: 40,
		backgroundColor: 'transparent',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        borderWidth: 1,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        display: 'flex',
        cursor: 'pointer'
	},
    yourSubCard: {
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#d7d7d7',
        marginRight: 15,
        marginBottom: 15,
        justifyContent: 'space-between'
    },
    footerSubscribe: {
		position: 'sticky',
		bottom: 0,
		left: 0,
		backgroundColor: "white",
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderRadius: 4,
		borderTopWidth: 1,
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderBottomWidth: 0,
		paddingTop: 10
	},
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getConquestSubscribersIdsPerSeason,
    loadUserMintedNfts,
    updateInfoTransactionModal,
    subscribeToLords,
    loadBlockNftsSplit,
    signFightTransaction
})(Conquest)
