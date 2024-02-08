import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import moment from 'moment'
import _ from 'lodash'
import { TbSortAscendingNumbers, TbSortDescendingNumbers } from 'react-icons/tb'
import ModalFightsFlashTournament from './common/ModalFightsFlashTournament'
import ModalCreateTournament from './common/ModalCreateTournament'
import ModalChooseWizard from './common/ModalChooseWizard'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getPendingTournaments,
    getCompletedTournaments,
    getWizaBalance,
    loadUserMintedNfts,
    updateInfoTransactionModal,
    selectWizard,
    createTournament,
    joinTournament,
    sortAutoByKey
} from '../actions'
import 'reactjs-popup/dist/index.css';

const placeholder = require('../assets/placeholder.png')
const placeholder_druid = require('../assets/placeholder_druid.png')
const placeholder_cleric = require('../assets/placeholder_cleric.png')

class FlashTournaments extends Component {
    constructor(props) {
        super(props)

        this.state = {
            error: "",
            section: 1,
            showModalFights: false,
            showModalCreate: false,
            showModalChooseWizard: false,
            maxLevelChooseWizard: 0,
            fights: {},
            tournamentInfo: {},
            joinTournamentid: "",
            sortByKey: "playersDesc",
            completedToShowAmount: 15
        }
    }

    componentDidMount() {
		document.title = "Flash Tournaments - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadPending()
            this.loadCompleted()
            this.getWizaBalance()
            this.loadMinted()
        }, 500)
	}

    loadPending() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getPendingTournaments(chainId, gasPrice, gasLimit, networkUrl)
    }

    loadCompleted() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getCompletedTournaments(chainId, gasPrice, gasLimit, networkUrl)
    }

    getWizaBalance() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		if (account && account.account) {
			this.props.getWizaBalance(chainId, gasPrice, gasLimit, networkUrl, account.account)
		}
    }

    loadMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {
            this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account)
        }
    }

    createTournament(idnft, buyin, maxLevel, name, winners, nPlayers, type) {
        const { account, chainId, gasPrice, netId } = this.props

        if (!account || (account && !account.account)) {
            return
        }

        //console.log(idnft, buyin, maxLevel);

        this.props.updateInfoTransactionModal({
            transactionToConfirmText: 'You are about to create a tournament.',
            typeModal: 'createtournament',
            transactionOkText: 'Tournament created successfully',
            makeOfferValues: { buyin, maxLevel, name, winners, nPlayers, type }
        })

        this.props.createTournament(chainId, gasPrice, netId, idnft, account, buyin, maxLevel, name, winners, nPlayers, type)
    }

    joinTournament(idnft) {
        const { account, chainId, gasPrice, netId, pendingTournaments } = this.props
        const { joinTournamentid } = this.state

        if (!account || (account && !account.account)) {
            return
        }

        //console.log(joinTournamentid, idnft);
        const infoTorneo = pendingTournaments.find(i => i.id === joinTournamentid)
        //console.log(infoTorneo);
        //return

        this.props.updateInfoTransactionModal({
            transactionToConfirmText: `You are about to join the tournament ID: ${joinTournamentid} with #${idnft}`,
            typeModal: 'jointournament',
            transactionOkText: 'Tournament joined successfully',
            makeOfferValues: infoTorneo
        })

        this.props.joinTournament(chainId, gasPrice, netId, joinTournamentid, idnft, account)
    }

    renderMenu() {
        const { section } = this.state
        const { mainTextColor, isDarkmode } = this.props

        let textColor = isDarkmode ? "#1d1d1f" : "white"

        return (
            <div style={{ alignItems: 'center', justifyContent: 'center', borderColor: '#d7d7d7', borderStyle: 'solid', borderRadius: 4, borderWidth: 1, padding: 6, marginBottom: 40 }}>

                <button
                    style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 32, borderRadius: 4, backgroundColor: section === 1 ? mainTextColor : 'transparent' }}
                    onClick={() => {
                        this.setState({ section: 1, sortByKey: 'playersDesc' }, () => {
                            this.sortBy('playersDesc')
                        })
                    }}
                >
                    <p style={{ fontSize: 15, color: section === 1 ? textColor : mainTextColor }} className="text-medium">
                        Pending
                    </p>
                </button>

                <button
                    style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 32, borderRadius: 4, backgroundColor: section === 2 ? mainTextColor : 'transparent' }}
                    onClick={() => {
                        this.setState({ section: 2, sortByKey: 'completedAt' }, () => {
                            this.sortBy('completedAt')
                        })
                    }}
                >
                    <p style={{ fontSize: 15, color: section === 2 ? textColor : mainTextColor }} className="text-medium">
                        Completed
                    </p>
                </button>

            </div>
        )
    }

    renderImgPlayer(wiz, idx, isFull, imgWidth) {
        const { userMintedNfts } = this.props

        let isMine = false

        if (userMintedNfts) {
            for (var i = 0; i < userMintedNfts.length; i++) {
                if (userMintedNfts[i].id === wiz) {
                    isMine = true
                    break
                }
            }
        }


        if (isFull || isMine) {
            return (
                <a
                    key={wiz}
                    href={`${window.location.protocol}//${window.location.host}/nft/${wiz}`}
                    style={{ cursor: 'pointer', margin: 5 }}
                    onClick={(e) => {
                        e.preventDefault()
                        this.props.selectWizard(wiz)
                        this.props.history.push(`/nft/${wiz}`)
                    }}
                >
                    <Popup
                        trigger={open => (
                            <div style={{ alignItems: 'center' }}>
                                <img
                                    src={getImageUrl(wiz)}
                                    style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
                                    alt={wiz}
                                />
                            </div>
                        )}
                        position="top center"
                        on="hover"
                    >
                        <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <p style={{ fontSize: 16, textAlign: 'center', color: "#1d1d1f" }}>
                                Wizard #{wiz}
                            </p>
                        </div>
                    </Popup>
                </a>
            )
        }

        let img = placeholder;
        if (parseInt(wiz) >= 1024 && parseInt(wiz) < 2048) {
            img = placeholder_cleric
        }
        else if (parseInt(wiz) >= 2048 && parseInt(wiz) < 3072) {
            img = placeholder_druid
        }

        return (
            <div style={{ alignItems: 'center', margin: 5 }} key={idx}>
                <img
                    src={img}
                    style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
                    alt="Wizard"
                />
            </div>
        )
    }

    renderInfoRecap(mainTextColor, item) {
        return (
            <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}>

                <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center', marginRight: 12 }}>
                    Wizards<br /><span style={{ fontSize: 16 }} className="text-bold">{item.players.length}/{item.nPlayers.int}</span>
                </p>

                <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center', marginRight: 12 }}>
                    Buyin<br /><span style={{ fontSize: 16 }} className="text-bold">{item.buyin}</span> $WIZA
                </p>

                <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }}>
                    Max level<br /><span style={{ fontSize: 16 }} className="text-bold">{item.maxLevel.int}</span>
                </p>
            </div>
        )
    }

    renderPendingTournament(item, index, isMobile) {
        const { account, mainTextColor, isDarkmode } = this.props

        const createdAt = moment(item.createdAt.timep)
        const diff = moment().to(createdAt)

        const isFull = item.nPlayers.int === item.players.length

        const imgWidth = isMobile ? 36 : 70

        //console.log(item.maxLevel.int);

        let prizes = "Winner takes all"
        if (item.winners && item.winners.int && item.winners.int === 2) {
            prizes = "70% 1st, 30% 2nd"
        }

        return (
            <div style={Object.assign({}, styles.rowTournament, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' })} key={index}>

                {
                    item.name ?
                    <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 4, textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? 0 : 15  }} className="text-bold">
                        {item.name}
                    </p>
                    : null
                }

                <div style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                    <div style={{ flexDirection: 'column', justifyContent: 'center', marginLeft: isMobile ? 0 : 15 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 7, textAlign: isMobile ? 'center' : 'left' }}>
                            ID: <span className="text-bold">{item.id}</span>
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, opacity: 0.8, textAlign: isMobile ? 'center' : 'left' }}>
                            Created: <br />{diff}
                        </p>
                    </div>

                    <div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flex: 1, marginLeft: 10, marginRight: 10 }}>
                        {item.players.map((wiz, idx) => {
                            return this.renderImgPlayer(wiz, idx, isFull, imgWidth)
                        })}
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>

                        {this.renderInfoRecap(mainTextColor, item)}

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                Type: {item.type || 'Classic'}
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                Prizes: {prizes}
                            </p>
                        </div>

                        {
                            isFull &&
                            <div style={styles.btnInfo}>
                                <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                                    About to start
                                </p>
                            </div>
                        }

                        {
                            item.wallets.includes(account.account) && !isFull &&
                            <div style={styles.btnInfo}>
                                <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                                    Joined
                                </p>
                            </div>
                        }

                        {
                            !item.wallets.includes(account.account) && !isFull &&
                            <button
                                style={Object.assign({}, styles.btnMenu, { width: 130, height: 34 })}
                                className="btnH"
                                onClick={() => this.setState({ joinTournamentid:item.id, showModalChooseWizard: true, maxLevelChooseWizard: item.maxLevel.int })}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Join
                                </p>
                            </button>
                        }

                    </div>

                </div>
            </div>
        )
    }

    renderCompletedTournament(item, index, isMobile) {
        const { userMintedNfts, account, mainTextColor, isDarkmode } = this.props

        //console.log(item);

        const timeFromBlock = item.completedAt ? item.completedAt.timep : item.createdAt.timep

        const time = moment(timeFromBlock)
        const diff = moment().to(time)

        const totalWiza = item.buyin * item.nPlayers.int
        const fee = 5 * totalWiza / 100
        let prizeWiza = totalWiza - fee
        let prizeWiza2 = 0
        let secondPlaceId = ""

        let prizes = "Winner takes all"

        if (item.winners && item.winners.int && item.winners.int === 2) {
            prizeWiza = _.round((totalWiza * 70 / 100) - (fee/2), 1)
            prizeWiza2 = _.round((totalWiza * 30 / 100) - (fee/2), 1)
            prizes = "70% 1st, 30% 2nd"

            let secondKey = "r3"
            if (item.nPlayers.int === 4) {
                secondKey = "r2"
            }
            if (item.nPlayers.int === 16) {
                secondKey = "r4"
            }
            if (item.nPlayers.int === 2) {
                secondKey = "r1"
            }

            const lastFight = item.fights[`${item.id}_${secondKey}`]
            secondPlaceId = lastFight[0].s1 === lastFight[0].winnerId ? lastFight[0].s2 : lastFight[0].s1
        }

        const imgWidth = isMobile ? 36 : 50

        let youSubbed = false
        for (var i = 0; i < item.wallets.length; i++) {
            const w = item.wallets[i]
            if (account && account.account && w === account.account) {
                youSubbed = true
            }
        }

        return (
            <div style={Object.assign({}, styles.rowTournament, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', borderColor: youSubbed ? '#840fb2' : '#d7d7d7', borderWidth: youSubbed ? 2 : 1 })} key={index}>

                {
                    item.name ?
                    <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 4, textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? 0 : 15  }} className="text-bold">
                        {item.name}
                    </p>
                    : null
                }

                <div style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                    <div style={{ flexDirection: 'column', justifyContent: 'center', marginLeft: isMobile ? 0 : 15 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 7, textAlign: isMobile ? 'center' : 'left' }}>
                            ID: <span className="text-bold">{item.id}</span>
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, opacity: 0.8, textAlign: isMobile ? 'center' : 'left' }}>
                            {item.completedAt ? "Completed" : "Created"}: <br />{diff}
                        </p>
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        <div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flex: 1, marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                            {item.players.map((wiz, idx) => {

                                let isYour = false
                                if (userMintedNfts) {
                                    for (let i = 0; i < userMintedNfts.length; i++) {
                                        if (userMintedNfts[i].id === wiz) {
                                            isYour = true
                                        }
                                    }
                                }

                                return (
                                    <a
                                        key={wiz}
                                        href={`${window.location.protocol}//${window.location.host}/nft/${wiz}`}
                                        style={{ cursor: 'pointer', margin: 5 }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            this.props.selectWizard(wiz)
                                            this.props.history.push(`/nft/${wiz}`)
                                        }}
                                    >
                                        <Popup
                                            trigger={open => (
                                                <div style={{ alignItems: 'center' }}>
                                                    <img
                                                        src={getImageUrl(wiz)}
                                                        style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: isYour ? 2 : 1, borderColor: isYour ? '#840fb2' : '#d7d7d7', borderStyle: 'solid' }}
                                                        alt={wiz}
                                                    />
                                                </div>
                                            )}
                                            position="top center"
                                            on="hover"
                                        >
                                            <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                <p style={{ fontSize: 16, textAlign: 'center', color: "#1d1d1f" }}>
                                                    Wizard #{wiz}
                                                </p>
                                            </div>
                                        </Popup>
                                    </a>
                                )
                            })}
                        </div>

                        {
                            !isMobile &&
                            <button
                                style={Object.assign({}, styles.btnMenu, { width: 130, height: 35 })}
                                className="btnH"
                                onClick={() => this.setState({ fights: item.fights, tournamentInfo: item, showModalFights: true })}
                            >
                                <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                    Fights
                                </p>
                            </button>
                        }
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>

                        {this.renderInfoRecap(mainTextColor, item)}

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                Type: {item.type || 'Classic'}
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                Prizes: {prizes}
                            </p>
                        </div>


                        <div>
                            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                <p style={{ fontSize: 16, color: mainTextColor }} className="text-bold">
                                    Winner
                                </p>

                                <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }}>
                                    {prizeWiza} $WIZA
                                </p>
                            </div>

                            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: isMobile ? 0 : 10 }}>
                                <a
                                    href={`${window.location.protocol}//${window.location.host}/nft/${item.fights.winner}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        this.props.selectWizard(item.fights.winner)
                                        this.props.history.push(`/nft/${item.fights.winner}`)
                                    }}
                                >
                                    <Popup
                                        trigger={open => (
                                            <div style={{ alignItems: 'center' }}>
                                                <img
                                                    src={getImageUrl(item.fights.winner)}
                                                    style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
                                                    alt={item.fights.winner}
                                                />
                                            </div>
                                        )}
                                        position="left center"
                                        on="hover"
                                    >
                                        <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                            <p style={{ fontSize: 16, color: "#1d1d1f", textAlign: 'center' }}>
                                                Wizard #{item.fights.winner}
                                            </p>
                                        </div>
                                    </Popup>
                                </a>
                            </div>

                            {
                                item.winners && item.winners.int && item.winners.int === 2 &&
                                <div>
                                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginRight: 5 }}>
                                        <p style={{ fontSize: 15, color: mainTextColor }}>
                                            2nd
                                        </p>

                                        <p style={{ fontSize: 13, color: mainTextColor, textAlign: 'center' }}>
                                            {prizeWiza2} $WIZA
                                        </p>
                                    </div>

                                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: isMobile ? 0 : 10 }}>
                                        <a
                                            href={`${window.location.protocol}//${window.location.host}/nft/${secondPlaceId}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                this.props.selectWizard(secondPlaceId)
                                                this.props.history.push(`/nft/${secondPlaceId}`)
                                            }}
                                        >
                                            <Popup
                                                trigger={open => (
                                                    <div style={{ alignItems: 'center' }}>
                                                        <img
                                                            src={getImageUrl(secondPlaceId)}
                                                            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
                                                            alt={secondPlaceId}
                                                        />
                                                    </div>
                                                )}
                                                position="left center"
                                                on="hover"
                                            >
                                                <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                    <p style={{ fontSize: 16, color: "#1d1d1f", textAlign: 'center' }}>
                                                        Wizard #{secondPlaceId}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </a>
                                    </div>
                                </div>
                            }

                        </div>

                    </div>

                    {
                        isMobile &&
                        <button
                            style={Object.assign({}, styles.btnMenu, { width: 130, height: 35, marginTop: 12 })}
                            className="btnH"
                            onClick={() => this.setState({ fights: item.fights, tournamentInfo: item, showModalFights: true })}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Fights
                            </p>
                        </button>
                    }

                </div>
            </div>
        )
    }

    sortBy(key) {
        const { section } = this.state
        const { pendingTournaments, completedTournaments } = this.props

        if (section === 1 && !pendingTournaments) {
            return
        }

        if (section === 2 && !completedTournaments) {
            return
        }

        this.setState({ sortByKey: key }, () => {
            this.props.sortAutoByKey(key, section)
        })
    }

    renderFiltri() {
        const { sortByKey, section } = this.state
        const { mainTextColor } = this.props

        const marginRight = 20

        return (
            <div style={{ alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', maxWidth: 1200, width: '100%' }}>

                {
                    section === 1 &&
                    <div style={{ alignItems: 'center', marginRight, marginBottom: 7 }}>

                        <p style={{ fontSize: 16, color: mainTextColor, marginRight: 5 }} className="text-medium">
                            Players
                        </p>

                        <button
                            style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'playersDesc' ? CTA_COLOR : 'transparent' })}
                            onClick={() => this.sortBy('playersDesc')}
                        >
                            <TbSortDescendingNumbers
                                color={sortByKey === 'playersDesc' ? 'white' : CTA_COLOR }
                                size={23}
                            />
                        </button>

                        <button
                            style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'playersAsc' ? CTA_COLOR : 'transparent' })}
                            onClick={() => this.sortBy('playersAsc')}
                        >
                            <TbSortAscendingNumbers
                                color={sortByKey === 'playersAsc' ? 'white' : CTA_COLOR }
                                size={23}
                            />
                        </button>

                    </div>
                }

                <div style={{ alignItems: 'center', marginRight, marginBottom: 7 }}>

                    <p style={{ fontSize: 16, color: mainTextColor, marginRight: 5 }} className="text-medium">
                        Buyin
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'buyinDesc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('buyinDesc')}
                    >
                        <TbSortDescendingNumbers
                            color={sortByKey === 'buyinDesc' ? 'white' : CTA_COLOR }
                            size={23}
                        />
                    </button>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'buyinAsc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('buyinAsc')}
                    >
                        <TbSortAscendingNumbers
                            color={sortByKey === 'buyinAsc' ? 'white' : CTA_COLOR }
                            size={23}
                        />
                    </button>

                </div>

                <div style={{ alignItems: 'center', marginBottom: 7 }}>

                    <p style={{ fontSize: 16, color: mainTextColor, marginRight: 5 }} className="text-medium">
                        Level
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'levelDesc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('levelDesc')}
                    >
                        <TbSortDescendingNumbers
                            color={sortByKey === 'levelDesc' ? 'white' : CTA_COLOR }
                            size={23}
                        />
                    </button>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'levelAsc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('levelAsc')}
                    >
                        <TbSortAscendingNumbers
                            color={sortByKey === 'levelAsc' ? 'white' : CTA_COLOR }
                            size={23}
                        />
                    </button>

                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { error, section, maxLevelChooseWizard, showModalChooseWizard, completedToShowAmount } = this.state
        const { loadingCompleted, loadingPending, pendingTournaments, completedTournaments, userMintedNfts, mainTextColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        //console.log(userMintedNfts);

        let wizardsPool = []
        if (showModalChooseWizard && maxLevelChooseWizard && userMintedNfts && userMintedNfts.length > 0) {
            wizardsPool = userMintedNfts.filter(i => i.level <= maxLevelChooseWizard)
        }

        const completedToShow = completedToShowAmount < completedTournaments.length ? completedTournaments.slice(0, completedToShowAmount) : completedTournaments

        return (
            <div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 30 }} className="text-medium">
                    Flash Tournaments
                </p>

                <div style={{ width: boxW, alignItems: 'center', justifyContent: 'center', position: 'relative', flexDirection: 'column', marginBottom: 20 }}>

                    {this.renderMenu()}

                    {
    					loadingPending && section === 1 ?
    					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
    						<DotLoader size={25} color={mainTextColor} />
    					</div>
    					: null
    				}

                    {
    					loadingCompleted && section === 2 ?
    					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
    						<DotLoader size={25} color={mainTextColor} />
    					</div>
    					: null
    				}

                    {
                        section === 1 &&
                        <p style={{ fontSize: 15, color: mainTextColor, textAlign: 'center', marginBottom: 20 }}>
                            The tournaments begins a few minutes after the maximum wizards are reached
                        </p>
                    }

                    {
                        section === 1 &&
                        <button
                            style={Object.assign({}, styles.btnMenu, { width: 214 })}
                            className="btnH"
                            onClick={() => {
                                this.setState({ showModalCreate: true })
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white', textAlign: 'center' }} className="text-medium">
                                Create a tournament
                            </p>
                        </button>
                    }

                </div>

                <div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    {
                        !isMobile &&
                        this.renderFiltri()
                    }

                    {
                        section === 1 ?
                        pendingTournaments.map((item, index) => {
                            return this.renderPendingTournament(item, index, isMobile)
                        })
                        :
                        completedToShow.map((item, index) => {
                            return this.renderCompletedTournament(item, index, isMobile)
                        })
                    }

                    {
                        section === 2 && completedToShowAmount < completedTournaments.length &&
                        <button
                            style={{ marginTop: 15, marginBottom: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 4, borderColor: "#d7d7d7", borderWidth: 1, borderStyle: 'solid' }}
                            className="btnH"
                            onClick={() => this.setState({ completedToShowAmount: this.state.completedToShowAmount + 10 })}
                        >
                            <p style={{ color: mainTextColor, fontSize: 15 }}>
                                Show more
                            </p>
                        </button>
                    }

                </div>

                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
                        {error}
                    </p>
                }


                <ModalFightsFlashTournament
                    showModal={this.state.showModalFights}
                    onCloseModal={() => this.setState({ showModalFights: false })}
                    fights={this.state.fights}
                    tournamentInfo={this.state.tournamentInfo}
                    history={this.props.history}
                    isMobile={isMobile}
                />

                <ModalCreateTournament
                    showModal={this.state.showModalCreate}
                    onCloseModal={() => this.setState({ showModalCreate: false })}
                    width={modalW}
                    wizaBalance={this.props.wizaBalance}
                    yourWizards={userMintedNfts}
                    createTournament={(idnft, buyin, maxLevel, name, winners, nPlayers, type) => {
                        this.setState({ showModalCreate: false })
                        this.createTournament(idnft, buyin, maxLevel, name, winners, nPlayers, type)
                    }}
                />

                <ModalChooseWizard
                    showModal={showModalChooseWizard}
                    onCloseModal={() => this.setState({ showModalChooseWizard: false })}
                    yourWizards={wizardsPool}
                    onSelect={(id) => {
                        this.setState({ showModalChooseWizard: false })
                        this.joinTournament(id)
                    }}
                />
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
    btnMenu: {
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        cursor: 'pointer',
        borderRadius: 4,
        width: 140,
        height: 40,
        backgroundColor: CTA_COLOR
    },
    btnInfo: {
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        borderRadius: 4,
        width: 130,
        height: 34,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: "#d7d7d7"
    },
    rowTournament: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 9,
        paddingBottom: 9,
        borderRadius: 4,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderWidth: 1,
        width: '100%',
        maxWidth: 1200,
        marginBottom: 15,
    },
    btnSort: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        marginRight: 5,
        borderRadius: 4,
        borderColor: CTA_COLOR,
        borderWidth: 1,
        borderStyle: 'solid'
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, wizaBalance, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer
    const { completedTournaments, pendingTournaments, loadingPending, loadingCompleted } = state.flashTournamentsReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, wizaBalance, userMintedNfts, completedTournaments, pendingTournaments, loadingPending, loadingCompleted, mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getPendingTournaments,
    getCompletedTournaments,
    getWizaBalance,
    loadUserMintedNfts,
    updateInfoTransactionModal,
    selectWizard,
    createTournament,
    joinTournament,
    sortAutoByKey
})(FlashTournaments)
