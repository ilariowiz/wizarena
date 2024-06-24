import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDoc, doc, query, collection, where, limit, orderBy, getDocs, documentId } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment'
import axios from 'axios'
import _ from 'lodash'
import Popup from 'reactjs-popup';
import Header from './Header'
import ModalConnectionWidget from './common/ModalConnectionWidget'
import ModalWizaPvP from './common/ModalWizaPvP'
import ModalStats from './common/ModalStats'
import ModalLoadingFight from './common/ModalLoadingFight'
import NftCardChoicePvP from './common/NftCardChoicePvP'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
    getPvPweek,
    getPvPopen,
    subscribeToPvPMass,
    incrementFightPvP,
    getWizaBalance,
    updateInfoTransactionModal,
    getPvPsubscription,
    signFightTransaction
} from '../actions'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import '../css/Nft.css'


class PvP extends Component {
    constructor(props) {
        super(props)

        let isConnected = this.props.account && this.props.account.account

        this.startedFight = false

        this.state = {
            error: "",
            loading: true,
            isConnected,
            showModalConnection: false,
            pvpOpen: false,
            pvpWeek: "",
            pvpWeekEnd: undefined,
            pvpFightsStart: undefined,
            pvpFightsStartDate: undefined,
            pvpFightsEndDate: undefined,
            dailyFights: 40,
            yourSubscribers: [],
            notSubbed: [],
            showModalWizaPvP: false,
            wizaAmount: 0,
            idNftIncrementFights: "",
            toSubscribe: [],
            replay: {},
            loadingReplay: false,
            allSubscribers: [],
            showModalStats: false,
            itemShowStats: undefined,
            signedCmd: undefined,
            showModalLoadingFight: false,
            textLoadingFight: "",
            fightId: ""
        }
    }

    componentDidMount() {
		document.title = "PvP - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadMinted()
		}, 500)
	}

    loadMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

        if (account.account) {
            if (userMintedNfts) {
                this.loadProfile()
            }
            else {
                this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
                    this.loadProfile()
                })
            }
        }
    }

    async loadProfile() {

        const docRef = doc(firebasedb, "aaa", `zGVGOTbYTTIcX3EIvMob`)

		const docSnap = await getDoc(docRef)
		let data = docSnap.data()

        //console.log(data);

        if (data) {
            this.loadPvpWeek()
            this.loadPvpOpen()
            this.loadWizaBalance()
        }
        else {
            this.setState({ error: "Firebase/Firestore not available, check if you have an adblocker or firewall blocking the connection" })
        }
	}

    loadWizaBalance() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
	}

    loadPvpWeek() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPweek(chainId, gasPrice, gasLimit, networkUrl, async(res) => {

            const docRef = doc(firebasedb, "pvp_week", "general")

    		const docSnap = await getDoc(docRef)
    		let data = docSnap.data()

            let dateFightsStart;

            if (data) {
                dateFightsStart = moment(data.start.seconds * 1000)
                const dateFightsStartTo = moment().to(dateFightsStart)

                //console.log(data);
                const dateEnd = moment(data.end.seconds * 1000)
                //console.log(dateEnd);
                const dateEndTo = moment().to(dateEnd)

                this.setState({ pvpWeek: res, pvpWeekEnd: dateEndTo, pvpFightsStart: dateFightsStartTo, pvpFightsStartDate: dateFightsStart, pvpFightsEndDate: dateEnd, dailyFights: data.dailyFights })
            }
            else {
                this.setState({ pvpWeek: res })
            }

            this.loadInfoPvP(res, dateFightsStart)
        })
    }

    loadPvpOpen() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPopen(chainId, gasPrice, gasLimit, networkUrl, (res) => {
            this.setState({ pvpOpen: res === "1" })
        })
    }

    async loadInfoPvP(week, dateFightsStart) {
        //console.log(dateFightsStart);
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPvPsubscription(chainId, gasPrice, gasLimit, networkUrl, week, (response) => {
            //console.log(response);

            this.setState({ allSubscribers: response })

            this.loadYourSubs(response, dateFightsStart, week)
        })
    }

    async loadYourSubs(allSubscribers, dateFightsStart, week) {
        const { userMintedNfts } = this.props

        let yourSubs = []
        let notSubbed = []

        for (var i = 0; i < userMintedNfts.length; i++) {
            const nft = userMintedNfts[i]

            const isSubbed = allSubscribers.find(y => y.idnft === nft.id)

            if (isSubbed && isSubbed.idnft) {
                yourSubs.push(isSubbed)
            }
            else if(!isSubbed) {
                notSubbed.push(nft)
            }
        }

        //console.log(yourSubs);

        const yourSubscribers = []

        if (yourSubs.length > 0) {
            const querySubs = []
            yourSubs.map(i => {
                querySubs.push(`${i.pvpweek}_#${i.idnft}`)
            })

            let keydb = "pvp_results"
            if (moment() < dateFightsStart) {
                keydb = "pvp_training"
            }

            //console.log(querySubs);

            const parts = _.chunk(querySubs, 10)

            await Promise.all(
				parts.map(async (chunks) => {
					const results = await getDocs(
						query(
							collection(firebasedb, keydb),
							where(documentId(), 'in', chunks)
						)
					)

					return results.docs.map(doc => {
						//console.log(doc.id);
                        let data = doc.data()

                        //console.log(doc.id);
                        const idnft = doc.id.replace(`${week}_#`, "")
                        data["id"] = idnft
                        data['fightsLeft'] = data.maxFights - (data.lose + data.win)

                        const extraInfo = userMintedNfts.find(i => i.id === idnft)
                        if (extraInfo) {
                            data = {...data, ...extraInfo}
                        }

                        yourSubscribers.push(data)

					})
				})
			)

            //yoursubs > 0 ma il be non ha ancora inviato i nuovi dati a firebase
            if (yourSubscribers.length === 0) {
                yourSubs.map(i => {

                    let data = {
                        id: i.idnft,
                        pvpweek: week,
                        address: i.address,
                        lose: 0,
                        win: 0,
                        maxFights: i.rounds.int,
                        fightsLeft: i.rounds.int
                    }

                    const extraInfo = userMintedNfts.find(y => y.id === i.idnft)
                    if (extraInfo) {
                        data = {...data, ...extraInfo}
                    }

                    yourSubscribers.push(data)
                })
            }
        }

        //console.log(yourSubscribers);

        yourSubscribers && yourSubscribers.length > 0 && yourSubscribers.sort((a, b) => {
            return parseInt(a.id) - parseInt(b.id)
        })

        this.setState({ loading: false, yourSubscribers, notSubbed })
    }

    subscribe(idNft, spellSelected, wizaAmount) {
		const { pvpWeek } = this.state
        const { account } = this.props

		if (!pvpWeek) {
			return
		}

		let refactorSpellSelected = { name: spellSelected.name }

		let obj = {
			spellSelected: refactorSpellSelected,
			idnft: idNft,
            week: pvpWeek,
            wizaAmount,
            id: `${pvpWeek}_${idNft}`,
            address: account.account
		}

		const toSubscribe = Object.assign([],  this.state.toSubscribe)
		toSubscribe.push(obj)

		this.setState({ toSubscribe })
	}

    subscribeMass() {
		const { chainId, gasPrice, gasLimit, netId, account } = this.props
		const { toSubscribe } = this.state

		let tot = 0
        toSubscribe.map(i => tot += i.wizaAmount)

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will subscribe ${toSubscribe.length} wizards for ${toSubscribe.length} KDA and ${tot} WIZA`,
			typeModal: 'subscribe_pvp',
			transactionOkText: `Your Wizards are registered for PvP arena!`
		})

		this.props.subscribeToPvPMass(chainId, gasPrice, gasLimit, netId, account, toSubscribe, tot)
	}

    incrementPvP(wizaAmount) {
        const { account, chainId, gasPrice, netId } = this.props
        const { pvpWeek, idNftIncrementFights } = this.state

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will increase the number of fights Wizard #${idNftIncrementFights} can do by ${wizaAmount}`,
			transactionOkText: `Maximum fights increased!`,
            nameNft: `#${idNftIncrementFights}`,
		})

        this.props.incrementFightPvP(chainId, gasPrice, 6000, netId, account, pvpWeek, idNftIncrementFights, wizaAmount)
    }

    sortById(array, key) {

        //console.log(array);

        let sorted = []

        if (array && array.length > 0) {
            sorted = array.sort((a, b) => {
                return parseInt(a[key]) - parseInt(b[key])
            })
        }

        return sorted
    }

    sortByIdSubs(array, key) {

        //console.log(array);

        let sorted = []

        if (array && array.length > 0) {
            sorted = array.sort((a, b) => {
                return parseInt(a[key]) - parseInt(b[key])
            })
        }

        sorted = sorted.sort((a, b) => {
            return b.fightsLeft - a.fightsLeft
        })
        //console.log(sorted);

        return sorted
    }

    async startFight(item) {
        const { account, chainId, gasPrice, networkUrl, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient } = this.props

        //console.log(item);
        if (!this.state.signedCmd) {

            this.setState({ showModalLoadingFight: true, textLoadingFight: "Sign the transaction to make the fight...", fightId: "" })

            this.props.signFightTransaction(gasPrice, chainId, netId, isXWallet, isQRWalletConnect, qrWalletConnectClient, networkUrl, account, async (response) => {
                //console.log(response);
                if (response.error) {
                    this.setState({ showModalLoadingFight: false, textLoadingFight: "", fightId: "" }, () => {
                        this.startedFight = false
                        setTimeout(() => {
                            toast.error(`Can't sign the transaction. Please retry`)
                        }, 1000)
                    })
                    return
                }

                this.setState({ signedCmd: response }, () => {
                    this.askForFight(item.id)
                })
            })
        }
        else {
            this.askForFight(item.id)
        }
    }

    async askForFight(id) {
        const { signedCmd } = this.state

        this.setState({ showModalLoadingFight: true, textLoadingFight: "Doing the fight...", fightId: "" })

        try {
            const responseFight = await axios.post('https://wizards-bot.herokuapp.com/fight', {
                id,
                mode: "pvp",
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

    handleResponseFight(response) {

        this.startedFight = false

        if (response.error) {

            const error = response.error
            if (error === "invalid") {
                this.setState({ signedCmd: undefined }, () => {
                    this.hideLoadingFightWithError(`Invalid request. Please sign the transaction.`)
                })
            }
            else if (error === "no_fights_left") {
                this.loadProfile()
                this.hideLoadingFightWithError("This wizard cannot do other fights")
            }
            else if (error === "no_opponent") {
                this.hideLoadingFightWithError("There are no opponents available")
            }
            else if (error === "no_owner") {
                this.hideLoadingFightWithError("You are not the owner of this wizard")
            }
        }
        //SUCCESS
        else {
            const { allSubscribers, pvpFightsStartDate, pvpWeek } = this.state

            this.loadYourSubs(allSubscribers, pvpFightsStartDate, pvpWeek )
            this.setState({ textLoadingFight: "Fight done!", fightId: response.success })
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

    async loadReplay(item) {
        //console.log(item);
        this.setState({ loadingReplay: true })

        let q1 = query(collection(firebasedb, "fights_pvp2"), where("wizards", "array-contains", item.id), limit(40), orderBy("timestamp", "desc"))
        const querySnapshot = await getDocs(q1)

        let fights = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());

            let data = doc.data()
            data['docId'] = doc.id

            //console.log(moment(data.timestamp.seconds * 1000).fromNow());

            fights.push(data)
        })

        //console.log(fights);

        fights.sort((a,b) => {
            const dateA = moment(a.timestamp.seconds * 1000)
            const dateB = moment(b.timestamp.seconds * 1000)

            //console.log(dateA, dateB);

            return dateB - dateA
        })

        //console.log(fights);

        fights = fights.slice(0, 4)

        //console.log(fights);
        //console.log(moment(fights[0]['timestamp']['seconds'] * 1000));

        let oldReplay = Object.assign({}, this.state.replay)
        oldReplay[item.id] = fights

        this.setState({ replay: oldReplay, loadingReplay: false })
    }


    openPopupIncrementFights(id) {
        this.setState({ showModalWizaPvP: true, idNftIncrementFights: id })
    }


    calcWinRate(item) {

        const lose = item.lose
        const win = item.win

        const totalFights = lose + win

        const winRate = Math.round(win * 100 / totalFights)

        if (!winRate) {
            return 0
        }

        return winRate
    }

    renderRowChoise(item, index, modalWidth) {
        const { toSubscribe } = this.state
        const { wizaBalance } = this.props


        if (!item.attack) {
            return <div key={index} />
        }

		return (
            <NftCardChoicePvP
				key={index}
				item={item}
				width={230}
				onSubscribe={(spellSelected, wizaAmount) => this.subscribe(item.id, spellSelected, wizaAmount)}
				modalWidth={modalWidth}
                index={index}
                wizaBalance={wizaBalance || 0}
                toSubscribe={toSubscribe}
                removeFromSubscribers={(idnft) => {
					let toSubscribe = Object.assign([], this.state.toSubscribe)

					const idx = toSubscribe.findIndex(i => i.idnft === idnft)
					if (idx > -1) {
						toSubscribe.splice(idx, 1)
					}
					this.setState({ toSubscribe })
				}}
			/>
		)
	}

    renderReplay(currentWizId, item, index) {
        const { mainTextColor } = this.props

        //console.log(item);

        const sfidanteId = item.idnft1 === currentWizId ? item.idnft2 : item.idnft1

        //console.log(sfidanteId);

        return (
            <a
                href={`${window.location.protocol}//${window.location.host}/fightreplay/fights_pvp2/${item.docId}`}
                target="_blank"
                rel="noopener noreferrer"
                className='btnH'
                style={{ flexDirection: 'column', alignItems: 'center', borderRadius: 4, marginBottom: 8, marginRight: 8, marginTop: 8 }}
                key={index}
            >
                <img
                    src={getImageUrl(sfidanteId)}
                    style={{ width: 70, height: 70, borderRadius: 4, marginBottom: 5 }}
                    alt={`${sfidanteId}`}
                />

                <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center', maxWidth: 70 }}>
                    #{sfidanteId}
                </p>
            </a>
        )
    }

    renderRowSub(item, index, isMobile, maxWidth) {
        //console.log(item);
        const { pvpFightsStartDate, pvpFightsEndDate, replay, loadingReplay } = this.state
        const { mainTextColor, isDarkmode } = this.props

        const winRate = this.calcWinRate(item)

        const totalFights = item.win + item.lose
        //console.log(totalFights, item);

        const fightsStart = moment().isAfter(pvpFightsStartDate)
        //console.log(fightsStart);

        const fightsEnd = moment().isAfter(pvpFightsEndDate)

        const hasFightsLeft = !fightsStart ? true : totalFights < item.maxFights

        return (
            <div
                key={index}
                style={Object.assign({}, styles.boxSubscribed, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", maxWidth: maxWidth - 10, marginRight: isMobile ? 5 : 20 })}
            >

                <div style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'start' }}>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ cursor: 'pointer' }}
                    >
                        <img
                            src={getImageUrl(item.id)}
                            style={{ width: 100, height: 100, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid', marginRight: 10, marginBottom: isMobile ? 7 : 0 }}
                            alt={item.id}
                        />
                    </a>

                    <div style={{ flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginRight: 20, width: 50 }} className="text-medium">
                                #{item.id}
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, width: 170 }}>
                                Win rate <span className="text-bold">{winRate}%</span>
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', marginBottom: 10, minWidth: 283 }}>
                            <p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
                                Win <span className="text-bold">{item.win}</span>
                            </p>

                            <p style={{ fontSize: 16, color: mainTextColor, marginRight: 10 }}>
                                Lose <span className="text-bold">{item.lose}</span>
                            </p>

                            {
                                item.maxFights && fightsStart &&
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    {totalFights}/{item.maxFights} fights
                                </p>
                            }

                            {
                                !fightsStart &&
                                <p style={{ fontSize: 16, color: mainTextColor }}>
                                    {item.win + item.lose} fights
                                </p>
                            }
                        </div>

                        {
                            item.level &&
                            <div style={{ alignItems: 'center', marginBottom: 10 }}>
                                <p style={{ fontSize: 14, color: mainTextColor, marginRight: 7 }}>
                                    Level
                                </p>

                                <p style={{ fontSize: 17, color: getColorTextBasedOnLevel(item.level, isDarkmode) }} className="text-bold">
                                    {item.level}
                                </p>
                            </div>
                        }

                        <button
                            style={{ marginBottom: 10, width: 100, height: 23, alignItems: 'center', borderRadius: 4, borderColor: CTA_COLOR, borderWidth: 1, borderStyle: 'solid' }}
                            onClick={() => this.setState({ showModalStats: true, itemShowStats: item })}
                        >
                            <p style={{ fontSize: 14, color: mainTextColor }} className="text-regular">
                                see stats
                            </p>
                        </button>

                        {
                            this.state.loading ?
                            <div
                                style={styles.btnPlay}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Loading...
                                </p>
                            </div>
                            :
                            null
                        }

                    </div>

                </div>


                {
                    !this.state.loading && !loadingReplay && !replay[item.id] ?
                    <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
                        <button
                            className="btnH"
                            style={styles.btnPlay}
                            onClick={() => {
                                if (this.state.loading) {
                                    return
                                }
                                this.loadReplay(item)
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Last fights
                            </p>
                        </button>

                        {
                            hasFightsLeft &&
                            <button
                                className="btnH"
                                style={styles.btnPlay}
                                onClick={() => {
                                    if (this.state.loading || this.startedFight) {
                                        return
                                    }

                                    this.startedFight = true

                                    this.startFight(item)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Fight
                                </p>
                            </button>
                        }

                        {
                            fightsStart && totalFights >= item.maxFights && !fightsEnd &&
                            <button
                                className="btnH"
                                style={Object.assign({}, styles.btnPlay, { width: 190 })}
                                onClick={() => {
                                    if (this.state.loading) {
                                        return
                                    }
                                    this.openPopupIncrementFights(item.id)
                                }}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Increment max fights
                                </p>
                            </button>
                        }
                    </div>
                    : null
                }

                {
                    loadingReplay &&
                    <div
                        style={styles.btnPlay}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Loading...
                        </p>
                    </div>
                }

                {
                    replay[item.id] &&
                    <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        {replay[item.id].map((items, index) => {
                            return this.renderReplay(item.id, items, index)
                        })}
                    </div>
                }
            </div>
        )
    }

    renderFooterSubscribe(isMobile) {
		const { toSubscribe } = this.state
        const { wizaBalance, account, mainTextColor } = this.props

        let totWiza = 0


		let temp = []
		toSubscribe.map(i => {

            totWiza += i.wizaAmount

			temp.push(
				<Popup
					key={i.idnft}
					trigger={open => (
						<img
							style={{ width: 60, height: 60, borderRadius: 4, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', cursor: 'pointer' }}
							src={getImageUrl(i.idnft)}
							alt={`#${i.idnft}`}
						/>
					)}
					position="top center"
					on="hover"
				>
					<div style={{ padding: 10, fontSize: 15 }}>
						#{i.idnft} <br /> Spell Selected: {i.spellSelected.name} <br /> WIZA: {i.wizaAmount}
					</div>
				</Popup>
			)
		})

		return (
			<div style={{ justifyContent: 'space-between', alignItems: 'center', flex: 1, flexDirection: isMobile ? 'column' : 'row' }}>
				<div style={{ flexWrap: 'wrap', marginLeft: isMobile ? 0 : 20 }}>
					{temp}
				</div>

                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginRight: 20 }}>

                    <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 6 }} className="text-bold">
                        Tot $WIZA {totWiza}
                    </p>
                    <button
    					className="btnH"
    					style={{ width: 180, height: 45, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 4, backgroundColor: CTA_COLOR }}
    					onClick={() => this.subscribeMass()}
    				>
    					<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    						Subscribe
    					</p>

                        {
                            account.account &&
                            <p style={{ fontSize: 13, color: 'white', marginTop: 2 }}>
                                Balance: {_.floor(wizaBalance, 1)} $WIZA
                            </p>
                        }

    				</button>
                </div>
			</div>
		)
	}

    renderBody(isMobile) {
        const { isConnected, showModalConnection, pvpOpen, yourSubscribers, notSubbed, error, pvpWeekEnd, pvpFightsStart, pvpFightsStartDate, allSubscribers, loading } = this.state
        const { account, mainTextColor, mainBackgroundColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        if (!account || !account.account || !isConnected) {

			return (
				<div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

                    <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }}>
                        PvP
                    </p>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 250, height: 250, borderRadius: 4, marginBottom: 15 }}
						alt='Placeholder'
					/>

					<button
						className='btnH'
						style={styles.btnConnect}
						onClick={() => this.setState({ showModalConnection: true })}
					>
						<p style={{ fontSize: 15, color: mainTextColor }}>
							Connect wallet
						</p>
					</button>

					<ModalConnectionWidget
						width={modalW}
						showModal={showModalConnection}
						onCloseModal={() => {
							this.setState({ showModalConnection: false, isConnected: true }, () => {
								setTimeout(() => {
									this.loadProfile()
								}, 500)
							})
						}}
					/>
				</div>
			)
		}

        if (error) {
			return (
				<div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, paddingLeft: padding, paddingRight: padding, paddingBottom: padding, paddingTop: 20, overflowY: 'auto', overflowX: 'hidden' }}>

					<img
						src={getImageUrl(undefined)}
						style={{ width: 250, height: 250, borderRadius: 4, marginBottom: 30 }}
						alt='Placeholder'
					/>

					<p style={{ fontSize: 16, color: 'red', textAlign: 'center', width: 250, marginBottom: 30 }}>
						{error}
					</p>
				</div>
			)
		}


        const sorted = this.sortById(notSubbed, "id")

        //console.log(pvpFightsStartDate);
        const now = moment()
        const fightsStart = now.isAfter(pvpFightsStartDate)
        //console.log(fightsStart);

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 30 }} className="text-medium">
                    PvP
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ marginBottom: 20 }}>

                    <div style={{  flexDirection: "column" }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                            PvP open: {pvpOpen ? "Yes" : "No"}
                        </p>

                        <p style={{ fontSize: 15, color: mainTextColor }}>
                            PvP fee: <span className="text-medium">1 $KDA</span>
                        </p>
                    </div>

                    <div style={{  flexDirection: "column", marginLeft: isMobile ? 10 : 50 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                            Subscribers {allSubscribers.length}
                        </p>
                    </div>

                    <div style={{ flexDirection: 'column', marginLeft: isMobile ? 10 : 50 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 10 }}>
                            Reward: +3 AP
                        </p>

                        {
                            !fightsStart &&
                            <p style={{ fontSize: 15, color: mainTextColor }}>
                                Registrations close: {pvpFightsStart}
                            </p>
                        }

                        {
                            pvpWeekEnd && fightsStart &&
                            <p style={{ fontSize: 15, color: mainTextColor }}>
                                PvP end: {pvpWeekEnd}
                            </p>
                        }

                    </div>
                </div>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 20 }}>
                    A bot will do all your wizards' fights for you, but you can do them manually during the Training period
                </p>

                <div style={{ width: '100%', height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 30 }} />

                <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 5 }} className="text-bold">
                    Your Wizards in the arena ({yourSubscribers.length})
                </p>

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 30 }}>
                    You will only fight wizards 25 levels higher or lower
                </p>

                <div style={{ flexDirection: 'row', width: boxW, marginBottom: 14, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                    {
                        yourSubscribers && yourSubscribers.length > 0 &&
                        yourSubscribers.map((item, index) => {
                            return this.renderRowSub(item, index, isMobile, boxW)
                        })
                    }

                </div>

                <div style={{ width: '100%', height: 1, minHeight: 1, backgroundColor: "#d7d7d7", marginBottom: 30 }} />

                {
                    !fightsStart && !loading &&
                    <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 40 }} className="text-bold">
                        Select the wizard you want to enroll in the PvP Arena
                    </p>
                }

                {
                    !fightsStart && !loading &&
                    <div style={{ flexWrap: 'wrap', marginBottom: 30, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        {
                            sorted && sorted.length > 0 &&
                            sorted.map((item, index) => {
                                return this.renderRowChoise(item, index, modalW)
                            })
                        }
                    </div>
                }

                {
                    this.state.toSubscribe.length > 0 &&
                    <div style={Object.assign({}, styles.footerSubscribe, { bottom: -padding, backgroundColor: mainBackgroundColor })}>
						{this.renderFooterSubscribe(isMobile)}
					</div>
                }

                {
                    this.state.showModalWizaPvP &&
                    <ModalWizaPvP
                        showModal={this.state.showModalWizaPvP}
                        onCloseModal={() => this.setState({ showModalWizaPvP: false })}
                        width={modalW}
                        wizaBalance={this.props.wizaBalance}
                        callback={(wizaAmount) => {
                            this.incrementPvP(wizaAmount)
                            this.setState({ showModalWizaPvP: false })
                        }}
                    />
                }

                {
                    this.state.showModalStats ?
                    <ModalStats
                        item={this.state.itemShowStats}
                        showModal={this.state.showModalStats}
                        onCloseModal={() => this.setState({ showModalStats: false })}
                    />
                    : undefined
                }

                {
                    this.state.showModalLoadingFight ?
                    <ModalLoadingFight
                        showModal={this.state.showModalLoadingFight}
                        onCloseModal={() => this.setState({ showModalLoadingFight: false })}
                        width={modalW}
                        text={this.state.textLoadingFight}
                        fightId={this.state.fightId}
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
    btnConnect: {
		width: 250,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderColor: "#d7d7d7",
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex'
	},
    btnPlay: {
        height: 36,
        width: 110,
        minWidth: 110,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
    btnWait: {
        height: 35,
        width: 150,
        minWidth: 150,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: CTA_COLOR,
        borderWidth: 2,
        borderStyle: 'solid'
    },
    boxSubscribed: {
        marginBottom: 20,
        marginRight: 20,
        alignItems: 'center',
        width: 'fit-content',
        padding: 10,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderRadius: 4,
        flexDirection: 'column'
    },
    footerSubscribe: {
		width: '100%',
		position: 'sticky',
		bottom: 0,
		left: 0,
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
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, isXWallet, isQRWalletConnect, qrWalletConnectClient, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, isXWallet, isQRWalletConnect, qrWalletConnectClient, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode };
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
	clearTransaction,
	setNetworkSettings,
	setNetworkUrl,
    getPvPweek,
    getPvPopen,
    subscribeToPvPMass,
    incrementFightPvP,
    getWizaBalance,
    updateInfoTransactionModal,
    getPvPsubscription,
    signFightTransaction
})(PvP)
