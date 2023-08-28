import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import getBoxWidth from './common/GetBoxW'
import allSpells from './common/Spells'
import { calcLevelWizard } from './common/CalcLevelWizard'
import ChallengeItem from './common/ChallengeItem'
import ModalLoading from './common/ModalLoading'
import { TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getChallengesSent,
    getChallengesReceived,
    cancelChallenge,
    updateInfoTransactionModal,
    acceptChallenge,
    loadSingleNft,
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
            textModalLoading: "",
            resultsSent: undefined,
            resultsReceived: undefined
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
			this.props.getChallengesSent(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {

                //console.log(response);
                if (response) {
                    //this.calcStats(response, true)
                    this.setState({ loadingSent: false })
                }
                else {
                    this.setState({ loadingSent: false })
                }
            })
		}
    }

    loadReceivedChallenges() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {
			this.props.getChallengesReceived(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
                //console.log(response);
                if (response) {
                    //this.calcStats(response, false)
                    this.setState({ loadingReceived: false })
                }
                else {
                    this.setState({ loadingReceived: false })
                }

            })
		}
    }

    calcStats(array, isSent) {
        let wins = 0
        let lose = 0
        let winKda = 0
        let loseKda = 0

        array.map(i => {
            if (i.fightId) {
                const decode = atob(i.fightId)
                const winner = decode.substring(20)

                const yourWiz = isSent ? i.wiz1id : i.wiz2id

                if (winner === yourWiz) {
                    winKda += i.amount
                    wins++
                }
                else {
                    loseKda += i.amount
                    lose++
                }
            }
        })

        const obj = { wins, lose, winKda, loseKda }
        //console.log(obj);

        //console.log(isSent);

        if (isSent) {
            this.setState({ resultsSent: obj, loadingSent: false })
        }
        else {
            this.setState({ resultsReceived: obj, loadingReceived: false })
        }
    }

    onWithdraw(challengeid) {
        const { account, chainId, gasPrice, netId } = this.props

        //console.log(challengeid);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will withdraw this challenge`,
			typeModal: 'cancelchallenge',
			transactionOkText: `Challenge withdrawn!`
		})

        this.props.cancelChallenge(chainId, gasPrice, netId, challengeid, account)
    }

    onAccept(challengeid, wiz2id) {
        const { account, chainId, gasPrice, netId } = this.props

        //console.log(challengeid, wiz2id);

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `You will accept this challenge`,
			typeModal: 'acceptchallenge',
			transactionOkText: `Challenge accepted!`
		})

        this.props.acceptChallenge(chainId, gasPrice, netId, challengeid, wiz2id, account)
    }

    async onShowResult(item) {
        //console.log(item);

        //lasciamo questo pezzo per supportare i replay vecchi
        if (!item.coin) {
            this.setState({ showModalLoading: true, textModalLoading: "Loading..." })

            const q = query(collection(firebasedb, "fights_duels"), where("challengeid", "==", item.id))
            const querySnapshot = await getDocs(q)

            let dataFightFirebase = undefined

            querySnapshot.forEach(doc => {
                dataFightFirebase = doc.data()
            })

            this.setState({ showModalLoading: false, textModalLoading: "" })
            this.props.setChallengeReplay(dataFightFirebase)

            setTimeout(() => {
                this.props.history.push(`/challengereplay/${dataFightFirebase.fightId}`)
            }, 300)
            //console.log("go to replay");
        }
        else {
            this.props.history.push(`/fight/${item.fightId}`)
        }
    }

    renderChallenges(array, loading, isReceived, isMobile) {

        //console.log(loading);

        if (loading) {
            return (
                <p style={{ fontSize: 16, color: this.props.mainTextColor }}>
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
                <p style={{ fontSize: 16, color: this.props.mainTextColor }}>
                    No challenges...
                </p>
            </div>
        )
    }

    renderBody(isMobile) {
        const { loadingSent, loadingReceived, error, resultsSent, resultsReceived } = this.state
        const { challengesReceived, challengesSent, mainTextColor } = this.props

        let { boxW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: padding/2, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 30 }} className="text-medium">
                    Challenges
                </p>

                <p style={{ fontSize: 18, color: mainTextColor, marginBottom: 10 }}>
                    Challenges received
                </p>

                {
                    resultsReceived &&
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }}>
                        Win <span style={{ color: TEXT_SECONDARY_COLOR, marginRight: 12 }} className="text-bold">{resultsReceived.wins}</span> Lose <span style={{ color: '#ed0404', marginRight: 12 }} className="text-bold">{resultsReceived.lose}</span> $KDA won <span style={{ color: resultsReceived.winKda - resultsReceived.loseKda > 0 ? TEXT_SECONDARY_COLOR : '#ed0404' }} className="text-bold">{resultsReceived.winKda - resultsReceived.loseKda}</span>
                    </p>
                }

                {
					loadingReceived ?
					<div style={{ height: 50, justifyContent: 'flex-start', alignItems: 'center' }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {this.renderChallenges(challengesReceived, loadingReceived, true, isMobile)}


                <p style={{ fontSize: 18, color: mainTextColor, marginTop: 30, marginBottom: 10 }}>
                    Challenges sent
                </p>

                {
                    resultsSent &&
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }}>
                        Win <span style={{ color: TEXT_SECONDARY_COLOR, marginRight: 12 }} className="text-bold">{resultsSent.wins}</span> Lose <span style={{ color: '#ed0404', marginRight: 12 }} className="text-bold">{resultsSent.lose}</span> KDA won <span style={{ color: resultsSent.winKda - resultsSent.loseKda > 0 ? TEXT_SECONDARY_COLOR : '#ed0404' }} className="text-bold">{resultsSent.winKda - resultsSent.loseKda}</span>
                    </p>
                }


                {
					loadingSent ?
					<div style={{ height: 50, justifyContent: 'flex-start', alignItems: 'center' }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {this.renderChallenges(challengesSent, loadingSent, false, isMobile)}


                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
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
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, challengesReceived, challengesSent, mainTextColor, mainBackgroundColor } = state.mainReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, challengesReceived, challengesSent, mainTextColor, mainBackgroundColor }
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
    setChallengeReplay
})(Challenges)
