import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import moment from 'moment'
import { AiOutlinePlus } from 'react-icons/ai'
import { TbSortAscendingNumbers, TbSortDescendingNumbers } from 'react-icons/tb'
import ModalFightsFlashTournament from './common/ModalFightsFlashTournament'
import ModalCreateTournament from './common/ModalCreateTournament'
import ModalChooseWizard from './common/ModalChooseWizard'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getPendingTournaments,
    getCompletedTournaments,
    getWizaBalance,
    loadEquipMinted,
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
            tournamentid: "",
            equipment: [],
            joinTournamentid: "",
            sortByKey: "playersDesc"
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
            this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                this.setState({ equipment: response })
            })

            this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account)
        }
    }

    createTournament(idnft, buyin, maxLevel, name, winners) {
        const { account, chainId, gasPrice, netId } = this.props

        if (!account || (account && !account.account)) {
            return
        }

        //console.log(idnft, buyin, maxLevel);

        this.props.updateInfoTransactionModal({
            transactionToConfirmText: 'You are about to create a tournament.',
            typeModal: 'createtournament',
            transactionOkText: 'Tournament created successfully',
            makeOfferValues: { buyin, maxLevel, name, winners }
        })

        this.props.createTournament(chainId, gasPrice, netId, idnft, account, buyin, maxLevel, name, winners)
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

        return (
            <div style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                <button
                    style={Object.assign({}, styles.btnMenu, { marginRight: 50, backgroundColor: section === 1 ? TEXT_SECONDARY_COLOR : 'transparent', borderColor: section === 1 ? TEXT_SECONDARY_COLOR : 'white' })}
                    className="btnH"
                    onClick={() => {
                        this.setState({ section: 1, sortByKey: 'playersDesc' }, () => {
                            this.sortBy('playersDesc')
                        })
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        PENDING
                    </p>
                </button>

                <button
                    style={Object.assign({}, styles.btnMenu, { backgroundColor: section === 2 ? TEXT_SECONDARY_COLOR : 'transparent', borderColor: section === 2 ? TEXT_SECONDARY_COLOR : 'white' })}
                    className="btnH"
                    onClick={() => {
                        this.setState({ section: 2, sortByKey: 'completedAt' }, () => {
                            this.sortBy('completedAt')
                        })
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        COMPLETED
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
                                    style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
                                    alt={wiz}
                                />
                            </div>
                        )}
                        position="top center"
                        on="hover"
                    >
                        <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <p style={{ fontSize: 18, textAlign: 'center' }}>
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
                    style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
                />
            </div>
        )
    }

    renderPendingTournament(item, index, isMobile) {
        const { account } = this.props

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
            <div style={Object.assign({}, styles.rowTournament, { flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' })} key={index}>

                {
                    item.name ?
                    <p style={{ fontSize: 17, color: 'white', marginBottom: 4, textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? 0 : 15  }}>
                        {item.name}
                    </p>
                    : null
                }

                <div style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                    <div style={{ flexDirection: 'column', justifyContent: 'center', marginLeft: isMobile ? 0 : 15 }}>
                        <p style={{ fontSize: 15, color: 'white', marginBottom: 7, textAlign: isMobile ? 'center' : 'left' }}>
                            ID: {item.id}
                        </p>

                        <p style={{ fontSize: 15, color: 'white', opacity: 0.6, textAlign: isMobile ? 'center' : 'left' }}>
                            Created: <br />{diff}
                        </p>
                    </div>

                    <div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flex: 1, marginLeft: 10, marginRight: 10 }}>
                        {item.players.map((wiz, idx) => {
                            return this.renderImgPlayer(wiz, idx, isFull, imgWidth)
                        })}
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-end', justifyContent: 'center', marginRight: isMobile ? 0 : 15 }}>

                        <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}>

                            <p style={{ fontSize: 21, color: 'white', textAlign: 'center', marginRight: 12 }}>
                                <span style={{ fontSize: 16 }}>Wizards</span><br />{item.players.length}/{item.nPlayers.int}
                            </p>

                            <p style={{ fontSize: 21, color: 'white', textAlign: 'center', marginRight: 12 }}>
                                <span style={{ fontSize: 16 }}>Buyin</span><br />{item.buyin} <span style={{ fontSize: 16 }}>WIZA</span>
                            </p>

                            <p style={{ fontSize: 21, color: 'white', textAlign: 'center' }}>
                                <span style={{ fontSize: 16 }}>Max Level</span><br />{item.maxLevel.int}
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 17, color: 'white' }}>
                                Prizes: {prizes}
                            </p>
                        </div>

                        {
                            isFull &&
                            <div style={Object.assign({}, styles.btnMenu, { width: 130, height: 35, cursor: 'default' })}>
                                <p style={{ fontSize: 14, color: 'white' }}>
                                    ABOUT TO START
                                </p>
                            </div>
                        }

                        {
                            item.wallets.includes(account.account) && !isFull &&
                            <div style={Object.assign({}, styles.btnMenu, { width: 130, height: 35, cursor: 'default' })}>
                                <p style={{ fontSize: 16, color: 'white' }}>
                                    JOINED
                                </p>
                            </div>
                        }

                        {
                            !item.wallets.includes(account.account) && !isFull &&
                            <button
                                style={Object.assign({}, styles.btnMenu, { backgroundColor: TEXT_SECONDARY_COLOR, width: 130, height: 35 })}
                                className="btnH"
                                onClick={() => this.setState({ joinTournamentid:item.id, showModalChooseWizard: true, maxLevelChooseWizard: item.maxLevel.int })}
                            >
                                <p style={{ fontSize: 17, color: 'white' }}>
                                    JOIN
                                </p>
                            </button>
                        }

                    </div>

                </div>
            </div>
        )
    }

    renderCompletedTournament(item, index, isMobile) {
        const { userMintedNfts, account } = this.props

        //console.log(userMintedNfts);

        const timeFromBlock = item.completedAt ? item.completedAt.timep : item.createdAt.timep

        const time = moment(timeFromBlock)
        const diff = moment().to(time)

        const totalWiza = item.buyin * item.nPlayers.int
        const fee = 5 * totalWiza / 100
        let prizeWiza = totalWiza - fee

        let prizes = "Winner takes all"

        if (item.winners && item.winners.int && item.winners.int === 2) {
            prizeWiza = (totalWiza * 70 / 100) - (fee/2)
            prizes = "70% 1st, 30% 2nd"
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
            <div style={Object.assign({}, styles.rowTournament, { flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', borderColor: youSubbed ? 'gold' : 'white' })} key={index}>

                {
                    item.name ?
                    <p style={{ fontSize: 17, color: 'white', marginBottom: 4, textAlign: isMobile ? 'center' : 'left', marginLeft: isMobile ? 0 : 15  }}>
                        {item.name}
                    </p>
                    : null
                }

                <div style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                    <div style={{ flexDirection: 'column', justifyContent: 'center', marginLeft: isMobile ? 0 : 15 }}>
                        <p style={{ fontSize: 15, color: 'white', marginBottom: 7, textAlign: isMobile ? 'center' : 'left' }}>
                            ID: {item.id}
                        </p>

                        <p style={{ fontSize: 15, color: 'white', opacity: 0.6, textAlign: isMobile ? 'center' : 'left' }}>
                            {item.completedAt ? "Completed" : "Created"}: <br />{diff}
                        </p>
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        <div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flex: 1, marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                            {item.players.map((wiz, idx) => {

                                let isYour = false
                                for (let i = 0; i < userMintedNfts.length; i++) {
                                    if (userMintedNfts[i].id === wiz) {
                                        isYour = true
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
                                                        style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: isYour ? 2 : 1, borderColor: isYour ? 'gold' : 'white', borderStyle: 'solid' }}
                                                        alt={wiz}
                                                    />
                                                </div>
                                            )}
                                            position="top center"
                                            on="hover"
                                        >
                                            <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                                <p style={{ fontSize: 18, textAlign: 'center' }}>
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
                                style={Object.assign({}, styles.btnMenu, { backgroundColor: TEXT_SECONDARY_COLOR, width: 130, height: 35 })}
                                className="btnH"
                                onClick={() => this.setState({ fights: item.fights, tournamentid: item.id, showModalFights: true })}
                            >
                                <p style={{ fontSize: 17, color: 'white' }}>
                                    FIGHTS
                                </p>
                            </button>
                        }
                    </div>

                    <div style={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginRight: 15 }}>

                        <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>

                            <p style={{ fontSize: 21, color: 'white', textAlign: 'center', marginRight: 12 }}>
                                <span style={{ fontSize: 16 }}>Wizards</span><br />{item.players.length}
                            </p>

                            <p style={{ fontSize: 21, color: 'white', textAlign: 'center', marginRight: 12 }}>
                                <span style={{ fontSize: 16 }}>Buyin</span><br />{item.buyin} <span style={{ fontSize: 16 }}>WIZA</span>
                            </p>

                            <p style={{ fontSize: 21, color: 'white', textAlign: 'center' }}>
                                <span style={{ fontSize: 16 }}>Max Level</span><br />{item.maxLevel.int}
                            </p>
                        </div>

                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: 17, color: 'white' }}>
                                Prizes: {prizes}
                            </p>
                        </div>


                        <div>
                            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                <p style={{ fontSize: 18, color: 'white' }}>
                                    WINNER
                                </p>

                                <p style={{ fontSize: 14, color: 'white', opacity: 0.8 }}>
                                    {prizeWiza} WIZA
                                </p>
                            </div>

                            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
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
                                                    style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
                                                    alt={item.fights.winner}
                                                />
                                            </div>
                                        )}
                                        position="left center"
                                        on="hover"
                                    >
                                        <div style={{ padding: 5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                            <p style={{ fontSize: 18, textAlign: 'center' }}>
                                                Wizard #{item.fights.winner}
                                            </p>
                                        </div>
                                    </Popup>
                                </a>
                            </div>

                        </div>

                    </div>

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

        const marginRight = 20

        return (
            <div style={{ alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', maxWidth: 1200, width: '100%' }}>

                {
                    section === 1 &&
                    <div style={{ alignItems: 'center', marginRight, marginBottom: 7 }}>

                        <p style={{ fontSize: 16, color: 'white', marginRight: 5 }}>
                            Players
                        </p>

                        <button
                            style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'playersDesc' ? CTA_COLOR : 'transparent' })}
                            onClick={() => this.sortBy('playersDesc')}
                        >
                            <TbSortDescendingNumbers
                                color='white'
                                size={23}
                            />
                        </button>

                        <button
                            style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'playersAsc' ? CTA_COLOR : 'transparent' })}
                            onClick={() => this.sortBy('playersAsc')}
                        >
                            <TbSortAscendingNumbers
                                color='white'
                                size={23}
                            />
                        </button>

                    </div>
                }

                <div style={{ alignItems: 'center', marginRight, marginBottom: 7 }}>

                    <p style={{ fontSize: 16, color: 'white', marginRight: 5 }}>
                        Buyin
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'buyinDesc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('buyinDesc')}
                    >
                        <TbSortDescendingNumbers
                            color='white'
                            size={23}
                        />
                    </button>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'buyinAsc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('buyinAsc')}
                    >
                        <TbSortAscendingNumbers
                            color='white'
                            size={23}
                        />
                    </button>

                </div>

                <div style={{ alignItems: 'center', marginBottom: 7 }}>

                    <p style={{ fontSize: 16, color: 'white', marginRight: 5 }}>
                        Level
                    </p>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'levelDesc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('levelDesc')}
                    >
                        <TbSortDescendingNumbers
                            color='white'
                            size={23}
                        />
                    </button>

                    <button
                        style={Object.assign({}, styles.btnSort, { backgroundColor: sortByKey === 'levelAsc' ? CTA_COLOR : 'transparent' })}
                        onClick={() => this.sortBy('levelAsc')}
                    >
                        <TbSortAscendingNumbers
                            color='white'
                            size={23}
                        />
                    </button>

                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { error, section, maxLevelChooseWizard, showModalChooseWizard } = this.state
        const { loadingCompleted, loadingPending, pendingTournaments, completedTournaments, userMintedNfts } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        //console.log(userMintedNfts);

        let wizardsPool = []
        if (showModalChooseWizard && maxLevelChooseWizard && userMintedNfts && userMintedNfts.length > 0) {
            wizardsPool = userMintedNfts.filter(i => i.level <= maxLevelChooseWizard)
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: '#8d8d8d', fontSize: 30, marginBottom: 20 }}>
                    Flash Tournaments
                </p>

                <div style={{ width: boxW, alignItems: 'center', justifyContent: 'center', position: 'relative', flexDirection: 'column', marginBottom: 20 }}>

                    {this.renderMenu()}

                    {
    					loadingPending && section === 1 ?
    					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
    						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
    					</div>
    					: null
    				}

                    {
    					loadingCompleted && section === 2 ?
    					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
    						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
    					</div>
    					: null
    				}

                    {
                        section === 1 &&
                        <p style={{ fontSize: 19, color: 'white', textAlign: 'center', marginBottom: 20 }}>
                            The tournaments begins a few minutes after the maximum wizards are reached
                        </p>
                    }

                    {
                        section === 1 &&
                        <button
                            style={Object.assign({}, styles.btnMenu, { backgroundColor: TEXT_SECONDARY_COLOR, width: 200 })}
                            className="btnH"
                            onClick={() => {
                                this.setState({ showModalCreate: true })
                            }}
                        >
                            <p style={{ fontSize: 16, color: 'white', textAlign: 'center' }}>
                                CREATE A TOURNAMENT
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
                        completedTournaments.map((item, index) => {
                            return this.renderCompletedTournament(item, index, isMobile)
                        })
                    }

                </div>

                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }


                <ModalFightsFlashTournament
                    showModal={this.state.showModalFights}
                    onCloseModal={() => this.setState({ showModalFights: false })}
                    fights={this.state.fights}
                    tournamentid={this.state.tournamentid}
                    history={this.props.history}
                />

                <ModalCreateTournament
                    showModal={this.state.showModalCreate}
                    onCloseModal={() => this.setState({ showModalCreate: false })}
                    width={modalW}
                    wizaBalance={this.props.wizaBalance}
                    equipment={this.state.equipment}
                    yourWizards={userMintedNfts}
                    createTournament={(idnft, buyin, maxLevel, name, winners) => {
                        this.setState({ showModalCreate: false })
                        this.createTournament(idnft, buyin, maxLevel, name, winners)
                    }}
                />

                <ModalChooseWizard
                    showModal={showModalChooseWizard}
                    onCloseModal={() => this.setState({ showModalChooseWizard: false })}
                    equipment={this.state.equipment}
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
					section={9}
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
    btnMenu: {
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        cursor: 'pointer',
        borderRadius: 2,
        width: 140,
        height: 40,
        borderWidth: 1,
        borderColor: TEXT_SECONDARY_COLOR,
        borderStyle: 'solid'
    },
    rowTournament: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 9,
        paddingBottom: 9,
        borderRadius: 2,
        borderColor: 'white',
        borderStyle: 'solid',
        borderWidth: 1,
        width: '100%',
        maxWidth: 1200,
        marginBottom: 15
    },
    btnSort: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        marginRight: 5,
        borderRadius: 2,
        borderColor: CTA_COLOR,
        borderWidth: 1,
        borderStyle: 'solid'
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, wizaBalance, userMintedNfts } = state.mainReducer
    const { completedTournaments, pendingTournaments, loadingPending, loadingCompleted } = state.flashTournamentsReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, wizaBalance, userMintedNfts, completedTournaments, pendingTournaments, loadingPending, loadingCompleted }
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getPendingTournaments,
    getCompletedTournaments,
    getWizaBalance,
    loadEquipMinted,
    loadUserMintedNfts,
    updateInfoTransactionModal,
    selectWizard,
    createTournament,
    joinTournament,
    sortAutoByKey
})(FlashTournaments)
