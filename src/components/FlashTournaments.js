import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import moment from 'moment'
import { AiOutlinePlus } from 'react-icons/ai'
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
    joinTournament
} from '../actions'
import 'reactjs-popup/dist/index.css';

const ring_placeholder = require('../assets/ring_placeholder.png')
const recipe_book = require('../assets/book.png')

class FlashTournaments extends Component {
    constructor(props) {
        super(props)

        /*
        this.completed = [{"buyin": 10.0,"completed": false,"createdAt": "2023-04-19T08:56:53Z","createdBy": "k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb","fights": {"0_r1": [{"fightId": "yExn3HPRHq3bsyqCTfm3","s1": "0","s2": "6","winnerId": "6"}, {"fightId": "IupG0rv1YBBhOXeql8dx","s1": "3","s2": "7","winnerId": "7"}, {"fightId": "RUcbYCtMTAfRpHmqsPFU","s1": "2","s2": "4","winnerId": "1"}, {"fightId": "UGHUf6hzuPWL73YIuXIZ","s1": "1","s2": "5","winnerId": "5"}],"0_r2": [{"fightId": "s4F2W4FJpYSr6UZMKz93","s1": "7","s2": "5","winnerId": "7"}, {"fightId": "5ZpPRmMjfHCtVc58kJ2V","s1": "1","s2": "6","winnerId": "6"}],"0_r3": [{"fightId": "w5Qnq0XNoaW54yqDXq5p","s1": "6","s2": "7","winnerId": "6"}], "winner": "6"},"id": "0","maxLevel": 330,"nPlayers": 8,"players": ["0", "2", "3", "1", "6", "7", "5", "4"],"wallets": ["k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb"]}]

        this.pending = [
            {"buyin": 10.0,"completed": false,"createdAt": "2023-04-19T08:56:53Z","createdBy": "k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb","fights": {},"id": "0","maxLevel": 330,"nPlayers": 8,"players": ["0", "2", "3", "1"],"wallets": ["k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb"]},
            {"buyin": 40.0,"completed": false,"createdAt": "2023-04-19T18:56:53Z","createdBy": "k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb","fights": {},"id": "1","maxLevel": 250,"nPlayers": 8,"players": ["100", "2881", "301", "1055", "99", "748"],"wallets": ["k:90f45921e0605560ace17ca8fbbe72df95ba7034abeec7a8a7154e9eda7114eb"]},
            {"buyin": 110.0,"completed": false,"createdAt": "2023-04-19T23:56:53Z","createdBy": "k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504","fights": {},"id": "2","maxLevel": 350,"nPlayers": 8,"players": ["1044", "2551",],"wallets": ["k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504"]},
            {"buyin": 1000.0,"completed": false,"createdAt": "2023-04-19T12:56:53Z","createdBy": "k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504","fights": {},"id": "3","maxLevel": 190,"nPlayers": 8,"players": ["10", "324", "1223", "911", "707", "544", "1111", "1200"],"wallets": ["k:461ae9f3c9c255112ac3797f6b15699c656c9bc44ed089551a0f792085ef9504"]}
        ]
        */

        this.state = {
            error: "",
            section: 1,
            showModalFights: false,
            showModalCreate: false,
            showModalChooseWizard: false,
            fights: {},
            tournamentid: "",
            equipment: [],
            joinTournamentid: ""
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

    createTournament(idnft, buyin, maxLevel) {
        const { account, chainId, gasPrice, netId } = this.props

        if (!account || (account && !account.account)) {
            return
        }

        //console.log(idnft, buyin, maxLevel);

        this.props.updateInfoTransactionModal({
            transactionToConfirmText: 'You are about to create a tournament.',
            typeModal: 'createtournament',
            transactionOkText: 'Tournament created successfully'
        })

        this.props.createTournament(chainId, gasPrice, netId, idnft, account, buyin, maxLevel)
    }

    joinTournament(idnft) {
        const { account, chainId, gasPrice, netId } = this.props
        const { joinTournamentid } = this.state

        if (!account || (account && !account.account)) {
            return
        }

        //console.log(joinTournamentid, idnft);

        this.props.updateInfoTransactionModal({
            transactionToConfirmText: `You are about to join the tournament ID: ${joinTournamentid} with #${idnft}`,
            typeModal: 'jointournament',
            transactionOkText: 'Tournament joined successfully'
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
                        this.setState({ section: 1 })
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
                        this.setState({ section: 2 })
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        COMPLETED
                    </p>
                </button>

            </div>
        )
    }

    renderPendingTournament(item, index) {
        const { account } = this.props

        const createdAt = moment(item.createdAt.timep)
        const diff = moment().to(createdAt)

        const isFull = item.nPlayers.int === item.players.length

        return (
            <div style={styles.rowTournament} key={index}>

                <div style={{ flexDirection: 'column', justifyContent: 'center', marginLeft: 15 }}>
                    <p style={{ fontSize: 15, color: 'white', marginBottom: 7 }}>
                        ID: {item.id}
                    </p>

                    <p style={{ fontSize: 15, color: 'white', opacity: 0.6 }}>
                        Created: <br />{diff}
                    </p>
                </div>

                <div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flex: 1, marginLeft: 10, marginRight: 10 }}>
                    {item.players.map((wiz, idx) => {
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
                                                style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
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

                <div style={{ flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', marginRight: 15 }}>

                    <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>

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
                            onClick={() => this.setState({ joinTournamentid:item.id, showModalChooseWizard: true })}
                        >
                            <p style={{ fontSize: 17, color: 'white' }}>
                                JOIN
                            </p>
                        </button>
                    }

                </div>
            </div>
        )
    }

    renderCompletedTournament(item, index, isMobile) {

        console.log(item);

        const createdAt = moment(item.createdAt)
        const diff = moment().to(createdAt)

        const totalWiza = item.buyin * item.nPlayers
        const fee = 5 * totalWiza / 100
        const prizeWiza = totalWiza - fee

        return (
            <div style={styles.rowTournament} key={index}>

                <div style={{ flexDirection: 'column', justifyContent: 'center', marginLeft: 15 }}>
                    <p style={{ fontSize: 15, color: 'white', marginBottom: 7 }}>
                        ID: {item.id}
                    </p>

                    <p style={{ fontSize: 15, color: 'white', opacity: 0.6 }}>
                        Created: <br />{diff}
                    </p>
                </div>

                <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    <div style={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', flex: 1, marginLeft: 10, marginRight: 10, marginBottom: 10 }}>
                        {item.players.map((wiz, idx) => {
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
                                                    style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: 'white', borderStyle: 'solid' }}
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

                    <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>

                        <p style={{ fontSize: 21, color: 'white', textAlign: 'center', marginRight: 12 }}>
                            <span style={{ fontSize: 16 }}>Wizards</span><br />{item.players.length}
                        </p>

                        <p style={{ fontSize: 21, color: 'white', textAlign: 'center', marginRight: 12 }}>
                            <span style={{ fontSize: 16 }}>Buyin</span><br />{item.buyin} <span style={{ fontSize: 16 }}>WIZA</span>
                        </p>

                        <p style={{ fontSize: 21, color: 'white', textAlign: 'center' }}>
                            <span style={{ fontSize: 16 }}>Max Level</span><br />{item.maxLevel}
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
        )
    }

    renderBody(isMobile) {
        const { error, section } = this.state
        const { loadingCompleted, loadingPending, pendingTournaments, completedTournaments } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        //console.log(loadingPending);

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
                        section === 1 ?
                        pendingTournaments.map((item, index) => {
                            return this.renderPendingTournament(item, index)
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
                    yourWizards={this.props.userMintedNfts}
                    createTournament={(idnft, buyin, maxLevel) => {
                        this.setState({ showModalCreate: false })
                        this.createTournament(idnft, buyin, maxLevel)
                    }}
                />

                <ModalChooseWizard
                    showModal={this.state.showModalChooseWizard}
                    onCloseModal={() => this.setState({ showModalChooseWizard: false })}
                    equipment={this.state.equipment}
                    yourWizards={this.props.userMintedNfts}
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
    joinTournament
})(FlashTournaments)
