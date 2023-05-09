import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { BiTimeFive } from 'react-icons/bi'
import { BsCheckCircle } from 'react-icons/bs'
import { MdOutlineReplay, MdOutlineCancel } from 'react-icons/md'
import { TbSwords } from 'react-icons/tb'
import getImageUrl from './GetImageUrl'
import {
    showWinnerChallenge
} from '../../actions'

import { CTA_COLOR, TEXT_SECONDARY_COLOR } from '../../actions/types'


class ChallengeItem extends Component {

    getExpire() {
		const { item } = this.props
		return moment(item.expiresat.timep)
	}

    renderExpiration() {
		const { item, mainTextColor } = this.props

		const diff = moment().to(this.getExpire())

		if (item.status === 'accepted') {
			return (
				<p style={{ fontSize: 16, color: mainTextColor }}>

				</p>
			)
		}

		return (
			<p style={{ fontSize: 14, color: mainTextColor, marginBottom: 7 }}>
				Expiration {diff}
			</p>
		)
	}

    getWinner() {
        const { item } = this.props

        if (item.fightId) {
            const decode = atob(item.fightId)
            const winner = decode.substring(20)

            //console.log(winner);
            return winner
        }

        return undefined
    }

    renderCta() {
        const { item, isMobile, isReceived, showWinnerChallenges, mainTextColor } = this.props

        //console.log(item.fightId);

        //sfida che hai inviato ma non ancora accettata o scaduta
        if (item.status === "pending" && !isReceived) {

            const isExpired = moment().isAfter(item.expiresat.timep)
            //console.log(isExpired);

            //scaduta
            if (isExpired) {
                return (
                    <button
                        className="btnH"
                        style={styles.btnCta}
                        onClick={() => this.props.onWithdraw()}
                    >
                        <MdOutlineCancel
                            color='white'
                            size={20}
                        />
                        <p style={{ fontSize: 15, color: 'white', marginLeft: 6 }} className="text-medium">
                            Withdraw
                        </p>
                    </button>
                )
            }

            //non scaduta
            return (
                <div
                    style={Object.assign({}, styles.btnCta, { backgroundColor: 'transparent', borderColor: "#d7d7d7" })}
                >
                    <BiTimeFive
                        color={mainTextColor}
                        size={20}
                    />

                    <p style={{ fontSize: 15, color: mainTextColor, marginLeft: 6 }} className="text-medium">
                        Pending
                    </p>
                </div>
            )
        }

        if (item.status === "pending" && isReceived) {
            return (
                <button
                    className="btnH"
                    style={styles.btnCta}
                    onClick={() => this.props.onAccept()}
                >
                    <BsCheckCircle
                        color='white'
                        size={20}
                    />

                    <p style={{ fontSize: 15, color: 'white', marginLeft: 6 }} className="text-medium">
                        Accept
                    </p>
                </button>
            )
        }

        if (item.status === "accepted") {

            if (item.fightId) {

                const winner = this.getWinner()

                return (
                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                        {
                            showWinnerChallenges.includes(item.id) &&
                            <p style={{ fontSize: 15, marginBottom: 4, color: TEXT_SECONDARY_COLOR }} className="text-medium">
                                Winner: #{winner}
                            </p>
                        }

                        <button
                            className="btnH"
                            style={styles.btnCta}
                            onClick={() => {
                                this.props.onShowResult()
                            }}
                        >
                            <MdOutlineReplay
                                color='white'
                                size={20}
                            />
                            <p style={{ fontSize: 15, color: 'white', marginLeft: 6 }} className="text-medium">
                                Replay
                            </p>
                        </button>
                    </div>
                )
            }

            return (
                <button
                    className="btnH"
                    style={styles.btnCta}
                    onClick={() => this.props.onShowResult()}
                >
                    <TbSwords
                        color='white'
                        size={20}
                    />

                    <p style={{ fontSize: 15, color: 'white', marginLeft: 6 }} className="text-medium">
                        Fight
                    </p>
                </button>
            )
        }
    }

	render() {
		const { item, isMobile, showWinnerChallenges, mainTextColor } = this.props

        let winner = ""
        if (item.status === "accepted" && item.fightId && showWinnerChallenges.includes(item.id)) {
            winner = this.getWinner()
        }

		return (
			<div style={styles.container}  key={item.id}>

                <div style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 7 }}>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.wiz1id}`}
                        style={styles.btnImage}
                        className="btnH"
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push(`./nft/${item.wiz1id}`)
                        }}
                    >
                        <img
                            src={getImageUrl(item.wiz1id)}
                            style={styles.img}
                        />

                        <p style={{ fontSize: 16, color: winner === item.wiz1id ? TEXT_SECONDARY_COLOR : mainTextColor, textAlign: 'center' }} className="text-medium">
                            #{item.wiz1id}
                        </p>
                    </a>

                    <p style={{ fontSize: 15, color: mainTextColor, marginLeft: 10, marginRight: 10 }}>
                        VS
                    </p>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.wiz2id}`}
                        style={styles.btnImage}
                        className="btnH"
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push(`./nft/${item.wiz2id}`)
                        }}
                    >
                        <img
                            src={getImageUrl(item.wiz2id)}
                            style={styles.img}
                        />
                        <p style={{ fontSize: 16, color: winner === item.wiz2id ? TEXT_SECONDARY_COLOR : mainTextColor, textAlign: 'center' }} className="text-medium">
                            #{item.wiz2id}
                        </p>
                    </a>

                </div>

				{
					item.amount ?
					<p style={{ fontSize: 15, color: mainTextColor, marginBottom: 9 }} className="text-bold">
						$KDA {item.amount}
					</p>
					:
					undefined
				}

                {this.renderExpiration()}

                {this.renderCta()}

                <p style={{ fontSize: 13, color: mainTextColor }}>
                    Challenge ID: {item.id}
                </p>

			</div>
		)
	}
}

const styles = {
	container: {
        flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
        borderRadius: 4,
        flexWrap: 'wrap',
        marginBottom: 15,
        padding: 7,
        marginRight: 15,
        minWidth: 223
	},
    btnImage: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer'
    },
    img: {
        width: 70,
        height: 70,
        borderRadius: 4,
        marginBottom: 3,
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
    },
    btnCta: {
        backgroundColor: CTA_COLOR,
        width: 120,
        height: 34,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        marginBottom: 7
    }
}

const mapStateToProps = (state) => {
	const { showWinnerChallenges } = state.challengesReducer
    const { mainTextColor } = state.mainReducer

	return { showWinnerChallenges, mainTextColor }
}

export default connect(mapStateToProps, {
    showWinnerChallenge
})(ChallengeItem)
