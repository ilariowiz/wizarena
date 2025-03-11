import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { getDocs, collection, query, doc, getDoc, where } from "firebase/firestore";
import { firebasedb } from './Firebase';
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios'
import { MdOutlineDateRange } from 'react-icons/md'
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import Popup from 'reactjs-popup';
import Header from './Header'
import NftCardChoice from './common/NftCardChoice'
import ModalLoading from './common/ModalLoading'
import getLoadingFightText from './common/LoadingFightText'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getDungeonSubscribersIdsPerSeason,
    loadUserMintedNfts,
    signFightTransaction,
    subscribeToDungeons,
    updateInfoTransactionModal
} from '../actions'
import '../css/Nft.css'
import 'reactjs-popup/dist/index.css';


const orc_berserker = require('../assets/monsters/orc_1.png')
const orc_defensive = require('../assets/monsters/orc_defensive.png')
const orc_average = require('../assets/monsters/orc_average.png')
const orc_ninja = require('../assets/monsters/orc_ninja.png')
const medal = require('../assets/medal.png')
const ears_icon = require('../assets/menu/dungeons.png')

const MAX_WIZARDS_PER_WALLET = 50
const DAILY_FIGHTS = 1


class Dungeon extends Component {
    constructor(props) {
        super(props)

        this.SEASON_ID = ""
        this.SEASON_ID_FIGHTS = ""
        this.SEASON_NAME = ""

        this.startedFight = false

        this.startSub = false

        this.state = {
            loadingYourSubs: true,
            dungeonInfo: {},
            fightsDone: 0,
            showSubscribe: false,
            notSubbed: [],
            toSubscribe: [],
            yourSubs: [],
            categories: {},
            allData: [],
            wizardSelected: {},
            subscribing: false,
            loadingYourChampion: false,
            wizardSelectedLastFights: [],
            loadingReplays: false,
            signedCmd: undefined,
            showModalLoadingFight: false,
            textLoadingFight: "",
        }
    }

    async componentDidMount() {
		document.title = "Dungeons - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        const dungeonInfo = await this.loaddungeonInfo()

        this.SEASON_ID = dungeonInfo.ranking
        this.SEASON_NAME = dungeonInfo.name
        this.SEASON_ID_FIGHTS = "endurance_fights"

        this.setState({ dungeonInfo })

        setTimeout(() => {
            this.loadSubscribers()
        }, 500)
	}

    async loaddungeonInfo() {
        const docRef = doc(firebasedb, "endurance_info", 'E6CZdHJ5VtAzYLAAg2xc')

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

        //console.log(data);

        return data
    }

    async loadSubscribers() {
        let allData = []
        let owners = {}

        const q = query(collection(firebasedb, this.SEASON_ID))
        const querySnapshot = await getDocs(q)

        querySnapshot.forEach(doc => {
            const d = doc.data()

            let temp = {}
            temp = d
            temp['docId'] = doc.id

            if (!temp.owner) {
                //console.log(temp);
            }

            if (!owners[temp.owner]) {
                owners[temp.owner] = 1
                allData.push(temp)
            }
            else {
                if (owners[temp.owner] < MAX_WIZARDS_PER_WALLET) {
                    owners[temp.owner] += 1
                    allData.push(temp)
                }
                else {
                    owners[temp.owner] += 1
                }
            }
        })

        //console.log(owners);

        let sub160 = []
        let sub225 = []
        let sub310 = []
        let sub400 = []

        allData.map(i => {
            if (i.level <= 160) {
                sub160.push(i)
            }

            else if (i.level > 160 && i.level <= 225) {
                sub225.push(i)
            }
            else if (i.level > 225 && i.level <= 310) {
                sub310.push(i)
            }
            else {
                sub400.push(i)
            }
        })

        sub160.sort((a, b) => {
            return b.ranking - a.ranking
        })

        sub225.sort((a, b) => {
            return b.ranking - a.ranking
        })

        sub310.sort((a, b) => {
            return b.ranking - a.ranking
        })

        sub400.sort((a, b) => {
            return b.ranking - a.ranking
        })

        const categories = {
            "sub160": sub160.slice(0, 10),
            "sub160count": sub160.length,
            "sub225": sub225.slice(0, 10),
            "sub225count":sub225.length,
            "sub310": sub310.slice(0, 10),
            "sub310count": sub310.length,
            "sub400": sub400.slice(0, 10),
            "sub400count": sub400.length
        }

        //console.log(categories);

        this.setState({ categories, allData }, () => {
            if (!this.props.userMintedNfts || this.props.userMintedNfts.length === 0) {
                this.loadMinted()
            }
            else {
                this.getSubscribers()
            }
        })
    }

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {

            this.setState({ loadingYourSubs: true })

			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
				//console.log(response);
				setTimeout(() => {
                    this.getSubscribers()
                }, 1000)
			})
		}
        else {
            this.getSubscribers()
        }
	}

    async getSubscribers() {
        const { chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

        let subscribersId = await this.props.getDungeonSubscribersIdsPerSeason(chainId, gasPrice, gasLimit, networkUrl, this.SEASON_ID)
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
            //console.log(userMintedNfts);

            for (let i = 0; i < userMintedNfts.length; i++) {
                const item = userMintedNfts[i]

                if (onlySubsIds.includes(item.id)) {
                    const data = await this.getFbDataSingleNft(item.id)
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

        //console.log(notSubbed);

        yourSubs.sort((a, b) => {
            return b.level - a.level
        })

        this.setState({ loadingYourSubs: false, yourSubs, notSubbed, countSubbedWizards: subscribersId.length })
	}

    async getFbDataSingleNft(idnft) {

        const q = query(collection(firebasedb, this.SEASON_ID), where("idnft", "==", idnft))
        const querySnapshot = await getDocs(q)

        let data = undefined

        querySnapshot.forEach(doc => {
            data = doc.data()
            data['docId'] = doc.id
        })

        return data
    }

    async loadYourChampion(infoNft) {
        const { allData } = this.state

        const data = allData.find(i => i.idnft === infoNft.id)
        //console.log(data);
        this.setState({ wizardSelected: infoNft, loadingYourChampion: false, fightsDone: data ? data.fightsDone : 0 })
    }

    async loadWizardSelectedLastFights(idnft) {
        let q1 = query(collection(firebasedb, this.SEASON_ID_FIGHTS), where("idnft1", "==", idnft))
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
            let timeA, timeB

            if (a.timestamp && a.timestamp.seconds && b.timestamp && b.timestamp.seconds) {
                timeA = moment(a.timestamp.seconds * 1000)
                timeB = moment(b.timestamp.seconds * 1000)

                return timeB - timeA
            }

            return 0
        })

        fights = fights.slice(0, 5)

        this.setState({ wizardSelectedLastFights: fights, loadingReplays: false })
    }

    async askForSub(signedCmdSub) {
        const { toSubscribe } = this.state

        try {
            const responseFight = await axios.post('https://wizards-bot.herokuapp.com/subtoarena', {
                ids: toSubscribe,
                signedCmd: signedCmdSub
            })

            //console.log(responseFight);

            if (responseFight.status === 200) {
                this.handleResponseSub(responseFight.data)
            }
            else {
                this.hideLoadingSubWithError(`Something goes wrong. Please retry`)
            }
        }
        catch(error) {
            this.hideLoadingSubWithError(`Something goes wrong. Please retry`)
        }
    }

    handleResponseSub(response) {

        this.startSub = false

        if (response.error) {

            const error = response.error
            if (error === "invalid") {
                this.setState({ signedCmd: undefined }, () => {
                    this.hideLoadingSubWithError(`Invalid request. Please sign the transaction.`)
                })
            }
            else if (error === "too_many_wizards") {
                this.hideLoadingSubWithError("You can't register that many wizards")
            }
            else if (error === "no_owner") {
                this.hideLoadingSubWithError("You are not the owner of this wizard")
            }
        }
        //SUCCESS
        else {
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        }
    }

    hideLoadingSubWithError(error) {
        this.setState({ subscribing: false }, () => {
            this.startSub = false
            setTimeout(() => {
                toast.error(error)
            }, 1000)
        })
    }

    async addToSubscribers(id) {
        const { toSubscribe } = this.state

        const newToSub = Object.assign([], toSubscribe)
        newToSub.push(id)

        this.setState({ toSubscribe: newToSub })
    }

    subscribeWizards() {
        const { chainId, gasPrice, gasLimit, netId, account } = this.props
        const { toSubscribe } = this.state

        //console.log(toSubscribe);
        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${toSubscribe.length} $KDA`,
			typeModal: 'subscribe_lords',
			transactionOkText: `Your Wizards are registered for Dungeons of Wizards World - ${this.SEASON_NAME}!`
		})

        const totKda = _.round(toSubscribe.length, 2)

        this.props.subscribeToDungeons(chainId, gasPrice, gasLimit, netId, account, this.SEASON_ID, toSubscribe, totKda)
    }

    async checkIfFightsLeft(idnft) {

        const q = query(collection(firebasedb, this.SEASON_ID), where("idnft", "==", idnft))
        const querySnapshot = await getDocs(q)

        let data = undefined

        querySnapshot.forEach(doc => {
            data = doc.data()
            data['docId'] = doc.id
        })

        if (data.fightsDone < DAILY_FIGHTS) {
            return true
        }

        return false
    }

    async startFight() {
        const { account, chainId, gasPrice, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient } = this.props
        const { signedCmd, wizardSelected } = this.state

        let seasonEnded = this.checkSeasonEnded()
        //console.log(seasonEnded);
        if (seasonEnded) {
            //season finita mentre stavi ancora con la pagina aperta e ti fa fare i fights
            window.location.reload()
            return
        }


        const hasFightsLeft = await this.checkIfFightsLeft(wizardSelected.id)
        //console.log(hasFightsLeft);
        if (!hasFightsLeft) {
            window.location.reload()
            return
        }

        //console.log(signedCmd);

        if (!signedCmd) {
            this.setState({ showModalLoadingFight: true, textLoadingFight: "Sign the transaction to make the fight..." })

            this.props.signFightTransaction(gasPrice, chainId, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, networkUrl, account, async (response) => {
                //console.log(response);
                if (response.error) {
                    this.setState({ showModalLoadingFight: false, textLoadingFight: "" }, () => {
                        this.startedFight = false
                        setTimeout(() => {
                            toast.error(`Can't sign the transaction. Please retry`)
                        }, 1000)
                    })
                    return
                }

                this.setState({ signedCmd: response }, () => {
                    this.askForFight()
                })
            })
        }
        else {
            this.askForFight()
        }
    }

    async askForFight() {
        const { signedCmd, wizardSelected } = this.state

        this.setState({ showModalLoadingFight: true, textLoadingFight: getLoadingFightText() })

        try {
            const responseFight = await axios.post('https://wizards-bot.herokuapp.com/fight', {
                id: wizardSelected.id,
                mode: "endurance",
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
            else if (error === "no_owner") {
                this.hideLoadingFightWithError("You are not the owner of this wizard")
            }
            else if (error === "season_ended") {
                this.hideLoadingFightWithError("The season is ended")
            }
            else if (error === "not_subbed") {
                this.hideLoadingFightWithError("This wizard is not subbed in Dungeons of Wizards World")
            }
            else if (error === "too_quick") {
                this.hideLoadingFightWithError("Too many fight requests in a short period of time")
            }
        }
        //SUCCESS
        else {
            this.setState({ showModalLoadingFight: false }, () => {
                setTimeout(() => {
                    this.props.history.push(`/fightreplaydungeon/${this.SEASON_ID_FIGHTS}/${response.success}`)
                }, 400)
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

    renderFooterSubscribe(isMobile) {
		const { toSubscribe, subscribing, yourSubs } = this.state
        const { mainTextColor, account } = this.props

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

				{
                    !subscribing ?
                    <button
    					className="btnH"
    					style={{ width: 180, height: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: CTA_COLOR, marginRight: 20 }}
    					onClick={() => {

                            if (yourSubs.length + toSubscribe.length > MAX_WIZARDS_PER_WALLET) {
                                toast.error(`You can register a maximum of ${MAX_WIZARDS_PER_WALLET} wizards`)
                                return
                            }

                            if (!this.startSub) {
                                this.startSub = true
                                this.subscribeWizards()
                            }
                        }}
    				>
    					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    						Subscribe
    					</p>

                        <p style={{ fontSize: 13, color: 'white', marginTop: 3 }}>
                            Balance: {_.floor(account.balance, 1)} $KDA
                        </p>

    				</button>
                    :
                    <div style={{ width: 180, height: 44, justifyContent: 'center', alignItems: 'center' }}>
                        <DotLoader size={25} color={mainTextColor} />
                    </div>
                }

			</div>
		)
	}

    checkSeasonEnded() {
        const { dungeonInfo } = this.state

        let seasonEnded = false
        if (dungeonInfo && dungeonInfo.end) {
            const endSeason = moment(dungeonInfo.end.seconds * 1000)
            if (endSeason < moment()) {
                seasonEnded = true
            }
        }

        return seasonEnded
    }

    renderYourSubs(item, index) {
        const { mainTextColor } = this.props
        const { loadingYourChampion } = this.state

        //console.log(item);

        let color;
        if (item.level > 310) {
            color = "gold"
        }

        if (item.level > 225 && item.level <= 310) {
            color = "#c0c0c0"
        }

        if (item.level > 160 && item.level <= 225) {
            color = "#cd7f32"
        }

        if (item.level <= 160) {
            color = "#ad9c8b"
        }

        const fightsLeft = item.fightsDone ? DAILY_FIGHTS - item.fightsDone : DAILY_FIGHTS

        return (
            <div style={Object.assign({}, styles.yourSubCard, { maxWidth: 120, borderColor: color })} key={index}>
                <img
                    style={{ width: 120, height: 120, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                    src={getImageUrl(item.id)}
                    alt={`#${item.id}`}
                />

                <p style={{ color: mainTextColor, fontSize: 15, marginTop: 10, marginBottom: 10, textAlign: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    {item.name} {item.nickname || ""}
                </p>

                <p style={{ color: mainTextColor, fontSize: 15, marginTop: 10, marginBottom: 10, textAlign: 'center', paddingLeft: 3, paddingRight: 3 }}>
                    Fights left {fightsLeft}
                </p>

                {
                    !loadingYourChampion ?
                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 36, borderTopLeftRadius: 0, borderTopRightRadius: 0 })}
                        onClick={() => {
                            if (!item.synced) {
                                return
                            }
                            this.loadYourChampion(item)
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                            {!item.synced ? 'Synchronizing...' : 'Select'}
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


    renderWizardSelected(isMobile, seasonStarted, seasonEnded) {
        const { mainTextColor } = this.props
        const { wizardSelected, fightsDone, wizardSelectedLastFights, allData, loadingReplays } = this.state

        const data = allData.find(i => i.idnft === wizardSelected.id)
        const wizardSelectedRanking = data.ranking

        const fightsLeft = DAILY_FIGHTS - fightsDone

        const maxWidth = 180

        return (
            <div style={{ flexDirection: isMobile ? 'column' : 'row', width: "100%", marginBottom: 15 }}>
                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>
                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${wizardSelected.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            style={{ width: 220, height: 220, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid', marginBottom: 10 }}
                            src={getImageUrl(wizardSelected.id)}
                            alt={`#${wizardSelected.id}`}
                        />
                    </a>

                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 30, backgroundColor: 'transparent', marginBottom: 8, cursor: 'pointer', borderWidth: 1, borderColor: CTA_COLOR, borderStyle: 'solid' })}
                        onClick={() => this.setState({ wizardSelected: {}, wizardSelectedElos: {}, fightsDone: 0, wizardSelectedLastFights: [] })}
                    >
                        <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                            Change
                        </p>
                    </button>
                </div>

                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ color: mainTextColor, fontSize: 18, marginTop: 10, marginBottom: 10, maxWidth: 220, textAlign: 'center' }} className="text-medium">
                        {wizardSelected.name} {wizardSelected.nickname}
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 30, backgroundColor: 'transparent', marginBottom: 20, cursor: 'pointer', borderWidth: 1, borderColor: CTA_COLOR, borderStyle: 'solid' })}
                        onClick={() => {
                            this.setState({ loadingReplays: true, wizardSelectedLastFights: [] })
                            this.loadWizardSelectedLastFights(wizardSelected.id)
                        }}
                    >
                        <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                            Last fights
                        </p>
                    </button>

                    <p style={{ fontSize: 20, color: CTA_COLOR, marginBottom: 10 }} className="text-bold">
                        Daily fights left {fightsLeft}
                    </p>

                    <div style={{ alignItems: 'center', marginBottom: 5 }}>
                        <p style={{ fontSize: 24, marginRight: 4, color: mainTextColor, textAlign: 'center' }}>
                            {wizardSelectedRanking}
                        </p>
                        <img
                            src={ears_icon}
                            style={{ width: 30 }}
                        />
                    </div>

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
                        !seasonEnded && seasonStarted && fightsLeft > 0 &&
                        <button
                            style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 36 })}
                            onClick={() => {
                                if (!this.startedFight) {
                                    this.startedFight = true
                                    this.startFight()
                                }
                            }}
                        >
                            <p style={{ fontSize: 17, color: 'white', textAlign: 'center' }} className="text-medium">
                                Fight
                            </p>
                        </button>
                    }

                    {
                        fightsLeft <= 0 &&
                        <div
                            style={Object.assign({}, styles.btnSubscribe, { width: maxWidth, height: 36, backgroundColor: 'transparent', marginBottom: 10, cursor: 'default' })}
                        >
                            <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                No fights left
                            </p>
                        </div>
                    }
                </div>

                {
                    loadingReplays &&
                    <div style={{ flexDirection: 'column', marginLeft: 20 }}>
                        <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 10 }} className="text-medium">
                            Last fights
                        </p>
                        <DotLoader size={20} color={mainTextColor} />
                    </div>
                }

                {
                    !loadingReplays && wizardSelectedLastFights && wizardSelectedLastFights.length > 0 &&
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
                }
            </div>
        )

        return (
            <div style={{ flexDirection: isMobile ? 'column' : 'row', width: "100%", marginBottom: 15 }}>

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

                    <button
                        style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 30, marginBottom: 25 })}
                        onClick={() => this.setState({ wizardSelected: {}, wizardSelectedElos: {}, fightsDone: 0, wizardSelectedLastFights: [] })}
                    >
                        <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                            Change
                        </p>
                    </button>

                    <p style={{ fontSize: 20, color: CTA_COLOR, marginBottom: 10 }} className="text-bold">
                        Daily fights left {fightsLeft}
                    </p>

                    <div style={{ alignItems: 'center', marginBottom: 5 }}>
                        <p style={{ fontSize: 24, marginRight: 4, color: mainTextColor, textAlign: 'center' }}>
                            {wizardSelectedRanking}
                        </p>
                        <img
                            src={ears_icon}
                            style={{ width: 30 }}
                        />
                    </div>

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
                        !seasonEnded && seasonStarted && fightsLeft > 0 &&
                        <button
                            style={Object.assign({}, styles.btnSubscribe, { width: 120, height: 36 })}
                            onClick={() => {
                                if (!this.startedFight) {
                                    this.startedFight = true
                                    this.startFight()
                                }
                            }}
                        >
                            <p style={{ fontSize: 16, color: 'white', textAlign: 'center' }} className="text-medium">
                                Fight
                            </p>
                        </button>
                    }

                    {
                        fightsLeft <= 0 &&
                        <div
                            style={Object.assign({}, styles.btnSubscribe, { width: maxWidth, height: 30, backgroundColor: 'transparent', marginBottom: 8, cursor: 'default', borderWidth: 1, borderColor: CTA_COLOR, borderStyle: 'solid' })}
                        >
                            <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                No fights left
                            </p>
                        </div>
                    }
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

    getInfoOrcReplay(item) {
        const info = item.actions[0].info2

        const orcName = info.name
        const orcType = info.type
        let orcImg = orc_berserker

        if (orcType === "Defensive") {
            orcImg = orc_defensive
        }
        if (orcType === "Ninja") {
            orcImg = orc_ninja
        }
        if (orcType === "Average") {
            orcImg = orc_average
        }
        if (orcType === "Berserker") {
            orcImg = orc_berserker
        }

        return { img: orcImg, name: orcName }
    }

    renderSingleFight(item, index) {
        const { wizardSelected } = this.state
        const { mainTextColor } = this.props

        //console.log(item);

        const info = this.getInfoOrcReplay(item)

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', marginRight: 20, justifyContent: 'space-between' }} key={index}>
                <img
                    style={{ width: 100, height: 100, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid' }}
                    src={info.img}
                    alt="Orc"
                />

                <p style={{ color: mainTextColor, fontSize: 13, marginTop: 5, marginBottom: 5, maxWidth: 100, textAlign: 'center' }}>
                    {info.name}
                </p>

                <a
                    style={Object.assign({}, styles.btnSubscribe, { width: 100, height: 30, cursor: 'pointer' })}
                    href={`${window.location.protocol}//${window.location.host}/fightreplaydungeon/${this.SEASON_ID_FIGHTS}/${item.docId}`}
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

    renderRowRank(item, index, array) {
        const { mainTextColor } = this.props

        let imageLeft = index < 5 ? medal : undefined

        const currentRanking = item.ranking

        if (index >= 5) {
            const lastRanking = array[4].ranking
            //console.log(currentRanking, previousRanking);
            if (currentRanking === lastRanking) {
                imageLeft = medal
            }
        }

        return (
            <div style={{ alignItems: 'center', padding: 5 }} key={item.idnft}>
                {
                    imageLeft ?
                    <img
                        src={imageLeft}
                        style={{ width: 34, height: 34, marginRight: 10 }}
                        alt="Cup"
                    />
                    :
                    <div style={{ width: 34, height: 34, marginRight: 10 }} />
                }
                <a
                    href={`${window.location.protocol}//${window.location.host}/nft/${item.idnft}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ cursor: 'pointer' }}
                >
                    <img
                        src={getImageUrl(item.idnft)}
                        style={{ height: 70, width: 70, marginRight: 10, borderRadius: 2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: "solid" }}
                        alt={`${item.idnft}`}
                    />
                </a>

                <div style={{ flexDirection: 'column', flex: 1 }}>

                    <div style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: 17, color: mainTextColor, width: 80 }}>
                            #{item.idnft}
                        </p>

                        <div style={{ alignItems: 'center' }}>
                            <p style={{ fontSize: 18, color: mainTextColor, textAlign: 'right' }}>
                                {item.ranking}
                            </p>
                            <img
                                src={ears_icon}
                                style={{ width: 26 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderRanking(level) {
        const { mainBackgroundColor } = this.props
        const { categories } = this.state

        let color;
        if (level === 400) {
            color = "gold"
        }

        if (level === 310) {
            color = "#c0c0c0"
        }

        if (level === 225) {
            color = "#cd7f32"
        }

        if (level === 160) {
            color = "#ad9c8b"
        }

        const key = `sub${level}`
        const keyCount = `${key}count`

        //console.log(categories);

        return (
            <div style={{ flexDirection: 'column', marginBottom: 30, flex: 1, borderWidth: 1, borderColor: color, borderStyle: 'solid', borderTopWidth: 0, borderRightWidth: 0 }}>

                <div style={{ backgroundImage: `linear-gradient(to right, ${color}, transparent)`, flexDirection: 'column' }}>
                    <p style={{ fontSize: 20, color: mainBackgroundColor, padding: 10, paddingBottom: 2 }} className="text-bold">
                        Level {level} Ranking
                    </p>

                    {
                        categories && categories[key] &&
                        <p style={{ fontSize: 12, color: mainBackgroundColor, marginLeft: 10, marginBottom: 3 }}>
                            {categories[keyCount]} wizards
                        </p>
                    }
                </div>

                {
                    categories && categories[key] &&
                    categories[key].map((i, index) => {
                        return this.renderRowRank(i, index, categories[key])
                    })
                }

            </div>
        )
    }

    renderBody(isMobile) {
        const { loadingYourSubs, yourSubs, wizardSelected, showSubscribe, dungeonInfo, notSubbed, countSubbedWizards } = this.state
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
        if (dungeonInfo && dungeonInfo.end) {
            seasonEnded = this.checkSeasonEnded()
            endSeason = moment(dungeonInfo.end.seconds * 1000)
            endSeasonText = moment().to(endSeason)
            endLongText = endSeason.format("DD/MM HH:mm")
        }

        let startSeasonText;
        let startLongText;
        let startSeason;
        let seasonStarted = false
        if (dungeonInfo && dungeonInfo.start) {
            startSeason = moment(dungeonInfo.start.seconds * 1000)
            startSeasonText = moment().to(startSeason)
            startLongText = startSeason.format("DD/MM HH:mm")

            if (startSeason < moment()) {
                seasonStarted = true
            }
        }

        ///// PAGINA SUBSCRIBE ******************************
        if (showSubscribe && dungeonInfo.start) {
           //console.log(startLongText);

           return (
               <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, paddingBottom: 0, overflowY: 'auto', overflowX: 'hidden' }}>

                   <div style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', width: '100%', marginBottom: 25 }}>
                       <p style={{ fontSize: 28, color: mainTextColor, marginBottom: isMobile ? 10 : 0 }} className="text-medium">
                           Dungeons of Wizards World
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
                           Buyin: 1 $KDA
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

        ///// SECTION PLAY ******************************
        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, overflowY: 'auto', overflowX: 'hidden' }}>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', width: '100%', marginBottom: 10 }}>
                    <p style={{ fontSize: 28, color: mainTextColor, marginBottom: isMobile ? 10 : 0 }} className="text-medium">
                        Dungeons of Wizards World
                    </p>

                    {
                       loadingYourSubs ?
                        <div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
                            <DotLoader size={25} color={mainTextColor} />
                        </div>
                        : null
                     }

                    <div style={{ flexDirection: 'column' }}>

                        {
                            !seasonEnded ?
                            <button
                                className='btnH'
                                style={Object.assign({}, styles.btnSubscribe, { marginBottom: 10 })}
                                onClick={() => {
                                    if (loadingYourSubs) {
                                        return
                                    }
                                    this.setState({ showSubscribe: true })
                                }}
                            >
                                {
                                    loadingYourSubs ?
                                    <DotLoader size={16} color={mainTextColor} />
                                    :
                                    null
                                }

                                {
                                    !loadingYourSubs && yourSubs.length < 16 ?
                                    <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                        Subscribe your wizards
                                    </p>
                                    : null
                                }
                            </button>
                            :
                            null
                        }

                        <Popup
                            trigger={
                                <button
                                    className='btnH'
                                    style={styles.btnRules}
                                    onClick={() => {
                                        this.setState({ showSubscribe: true })
                                    }}
                                >
                                    <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
                                        Rules & Prizes
                                    </p>
                                </button>
                            }
                            modal
                            nested
                        >
                            {close => (
                                <div style={{ flexDirection: 'column' }}>
                                    <div style={{ justifyContent: 'center', fontSize: 19, color: 'black', marginBottom: 10, marginTop: 5 }} className="text-bold">Rules & Prizes</div>
                                    <div style={{ fontSize: 16, color: 'black', paddingLeft: 5, paddingRight: 5, marginBottom: 15 }}>
                                      {' '}
                                      There are 4 leaderboards of 4 different levels. Your wizard will automatically participate in the one best suited to his level.
                                      <br />
                                      Each wizard has {DAILY_FIGHTS} daily fight and will fight one orc after another.
                                      <br />
                                      When your wizard is defeated, he will earn orc ears equal to the number of orcs he defeated.
                                      <br />
                                      <br />
                                      Prizes
                                      <br />
                                      <br />
                                      Top 5 of each ranking: 50 $WIZA for each orc ears
                                      <br />
                                    </div>
                                    <div style={{ justifyContent: 'center', marginBottom: 10 }}>
                                        <button
                                            style={{ color: 'black', fontSize: 17 }}
                                            className="text-bold"
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
                    this.renderWizardSelected(isMobile, seasonStarted, seasonEnded)
                    :
                    <div style={{ flexDirection: 'column' }}>
                        <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 10 }} className="text-medium">
                            Your subscribed Wizards <span style={{ fontSize: 13 }}>({yourSubs.length}/{MAX_WIZARDS_PER_WALLET})</span>
                        </p>

                        {
        					loadingYourSubs ?
        					<div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
        						<DotLoader size={25} color={mainTextColor} />
        					</div>
        					: null
        				}

                        <div style={{ overflow: 'scroll' }}>
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

                <p style={{ marginTop: 20, marginBottom: 20, fontSize: 24, color: mainTextColor }}>
                    Rankings
                </p>

                <div style={{ flexWrap: 'wrap' }}>

                    {this.renderRanking(400)}

                    {this.renderRanking(310)}

                    {this.renderRanking(225)}

                    {this.renderRanking(160)}

                </div>

                {
                    this.state.showModalLoadingFight ?
                    <ModalLoading
                        showModal={this.state.showModalLoadingFight}
                        onCloseModal={() => this.setState({ showModalLoadingFight: false })}
                        width={modalW}
                        text={this.state.textLoadingFight}
                        mainTextColor={mainTextColor}
                        mainBackgroundColor={mainBackgroundColor}
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
	const { account, chainId, gasPrice, gasLimit, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, userMintedNfts, mainTextColor, mainBackgroundColor } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, userMintedNfts, mainTextColor, mainBackgroundColor };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getDungeonSubscribersIdsPerSeason,
    loadUserMintedNfts,
    signFightTransaction,
    subscribeToDungeons,
    updateInfoTransactionModal
})(Dungeon)
