import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import moment from 'moment'
import getBoxWidth from './common/GetBoxW'
import fight from './common/CalcFight'
import allSpells from './common/Spells'
import { calcLevelWizard } from './common/CalcLevelWizard'
import ChallengeItem from './common/ChallengeItem'
import ModalLoading from './common/ModalLoading'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getChallengesSent,
    getChallengesReceived,
    cancelChallenge,
    updateInfoTransactionModal,
    acceptChallenge,
    loadSingleNft,
    getInfoItemEquipped,
    doResultChallenge,
    setChallengeReplay
} from '../actions'


class Challenges extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loadingSent: true,
            loadingReceived: true,
            error: "",
            showModalLoading: false,
            textModalLoading: ""
        }
    }

    componentDidMount() {
		document.title = "Challenges - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadSentChallenges()
            this.loadReceivedChallenges()
        }, 500)
	}

    loadSentChallenges() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {
			this.props.getChallengesSent(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
                this.setState({ loadingSent: false })
            })
		}
    }

    loadReceivedChallenges() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {
			this.props.getChallengesReceived(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
                this.setState({ loadingReceived: false })
            })
		}
    }

    onWithdraw(challengeid) {
        const { account, chainId, gasPrice, gasLimit, netId } = this.props

        //console.log(challengeid);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will withdraw this challenge`,
			typeModal: 'cancelchallenge',
			transactionOkText: `Challenge withdrawn!`
		})

        this.props.cancelChallenge(chainId, gasPrice, netId, challengeid, account)
    }

    onAccept(challengeid, wiz2id) {
        const { account, chainId, gasPrice, gasLimit, netId } = this.props

        //console.log(challengeid, wiz2id);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will accept this challenge`,
			typeModal: 'acceptchallenge',
			transactionOkText: `Challenge accepted!`
		})

        this.props.acceptChallenge(chainId, gasPrice, netId, challengeid, wiz2id, account)
    }

    async onShowResult(item) {
        const { chainId, gasPrice, gasLimit, netId, account } = this.props

        //console.log(item);

        this.setState({ showModalLoading: true, textModalLoading: "Loading..." })

        const q = query(collection(firebasedb, "fights_duels"), where("challengeid", "==", item.id))
        const querySnapshot = await getDocs(q)

        let dataFightFirebase = undefined

        querySnapshot.forEach(doc => {
            dataFightFirebase = doc.data()
        })

        //console.log("dataFightFirebase", dataFightFirebase);

        if (!item.fightId && !dataFightFirebase) {
            this.setState({ showModalLoading: true, textModalLoading: `Loading stats of #${item.wiz1id}` })

            this.loadNft(item.wiz1id, (info) => {
                //console.log(info);

                this.setState({ textModalLoading: `Loading stats of #${item.wiz2id}` })

                this.loadNft(item.wiz2id, async (info2) => {
                    //console.log(info2);
                    //console.log(item.fightId, dataFightFirebase);
                    this.setState({ textModalLoading: `Loading fight...` })

                    fight(info, info2, undefined, (history, winner) => {
                        console.log(history, winner);

                        this.updateFirebase(item.id, info, info2, history, winner)
                    })
                })
            })
        }
        else if (!item.fightId && dataFightFirebase) {
            this.setState({ showModalLoading: false, textModalLoading: "" })

            this.sendResult(item.id, dataFightFirebase.fightId)
        }
        else {
            this.setState({ showModalLoading: false, textModalLoading: "" })
            this.props.setChallengeReplay(dataFightFirebase)

            //console.log(dataFightFirebase);

            setTimeout(() => {
                this.props.history.push(`/challengereplay/${dataFightFirebase.fightId}`)
            }, 300)
            //console.log("go to replay");
        }
    }

    async updateFirebase(challengeid, info1, info2, history, winner) {

        const fightRef = doc(collection(firebasedb, "fights_duels"))

        const fightId = btoa(`${fightRef.id}${winner}`)

        const fightObj = {
            actions: history,
            idnft1: info1.id,
            idnft2: info2.id,
            winner,
            info1: info1,
            info2: info2,
            hp1: info1.hp,
            hp2: info2.hp,
            fightId,
            challengeid,
            timestamp: serverTimestamp()
        }

        //console.log(fightObj);
        const newDoc = await setDoc(fightRef, fightObj)

        this.sendResult(challengeid, fightId)
    }

    sendResult(challengeid, fightId) {
        const { chainId, gasPrice, gasLimit, netId, account } = this.props

        this.setState({ showModalLoading: false, textModalLoading: "" })

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will complete the challenge`,
			typeModal: 'resultchallenge',
			transactionOkText: `Challenge completed!`
		})

        this.props.doResultChallenge(chainId, gasPrice, netId, challengeid, fightId, account)
    }

    refactorSpellSelected(spellSelected) {
        const refactorSpellSelected = allSpells.find(i => i.name === spellSelected.name)
        //console.log(refactorSpellSelected);
        return refactorSpellSelected
    }

    loadNft(idNft, callback) {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, idNft, (response) => {
            //console.log(response);
            if (response.name) {

                this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, idNft, (ring) => {

                    let player = {}

                    player = response
                    player.level = calcLevelWizard(player)
                    player.attack = player.attack.int
                    player.damage = player.damage.int
                    player.defense = player.defense.int
                    player.hp = player.hp.int
                    player.speed = player.speed.int
                    player.spellSelected = this.refactorSpellSelected(response.spellSelected)

                    if (ring && ring.equipped) {
                        const stats = ring.bonus.split(",")
                        stats.map(i => {
                            const infos = i.split("_")
                            player[infos[1]] += parseInt(infos[0])
                        })
                    }

                    if (callback) {
                        callback(player)
                    }
                })
			}
			else {
				this.setState({ error: '404', loading: false })
			}
		})
    }

    renderChallenges(array, loading, isReceived, isMobile) {
        if (loading) {
            return (
                <p style={{ fontSize: 16, color: 'white' }}>
                    Loading...
                </p>
            )
        }

        if (array && array.length > 0) {
            return (
                <div style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {array.map((item, index) => {

                        //console.log(item);
                        return (
                            <ChallengeItem
                                item={item}
                                history={this.props.history}
                                isMobile={isMobile}
                                isReceived={isReceived}
                                key={item.id}
                                onWithdraw={() => this.onWithdraw(item.id)}
                                onAccept={() => this.onAccept(item.id, item.wiz2id)}
                                onShowResult={() => this.onShowResult(item) }
                            />
                        )
                    })}
                </div>
            )
        }

        return (
            <div>
                <p style={{ fontSize: 16, color: 'white' }}>
                    No challenges...
                </p>
            </div>
        )
    }

    renderBody(isMobile) {
        const { loadingSent, loadingReceived, error } = this.state
        const { challengesReceived, challengesSent } = this.props

        const { boxW } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: '#8d8d8d', fontSize: 30, marginBottom: 30 }}>
                    Challenges
                </p>

                <p style={{ fontSize: 20, color: 'white', marginBottom: 10 }}>
                    Challenges received
                </p>

                {
					loadingReceived ?
					<div style={{ height: 50, justifyContent: 'flex-start', alignItems: 'center' }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {this.renderChallenges(challengesReceived, loadingReceived, true, isMobile)}


                <p style={{ fontSize: 20, color: 'white', marginTop: 30, marginBottom: 10 }}>
                    Challenges sent
                </p>

                {
					loadingReceived ?
					<div style={{ height: 50, justifyContent: 'flex-start', alignItems: 'center' }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {this.renderChallenges(challengesSent, loadingSent, false, isMobile)}


                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }

                <ModalLoading
                    showModal={this.state.showModalLoading}
                    text={this.state.textModalLoading}
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
					section={23}
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
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, challengesReceived, challengesSent } = state.mainReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, challengesReceived, challengesSent }
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getChallengesSent,
    getChallengesReceived,
    cancelChallenge,
    updateInfoTransactionModal,
    acceptChallenge,
    loadSingleNft,
    getInfoItemEquipped,
    doResultChallenge,
    setChallengeReplay
})(Challenges)
