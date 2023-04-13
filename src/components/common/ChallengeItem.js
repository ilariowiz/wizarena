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

import { CTA_COLOR } from '../../actions/types'


class ChallengeItem extends Component {

    getExpire() {
		const { item } = this.props
		return moment(item.expiresat.timep)
	}

    renderExpiration() {
		const { item, isMobile } = this.props

		const diff = moment().to(this.getExpire())

		if (item.status === 'accepted') {
			return (
				<p style={{ fontSize: 16, color: 'white' }}>

				</p>
			)
		}

		return (
			<p style={{ fontSize: isMobile ? 14 : 16, color: 'white', marginBottom: 7 }}>
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
        const { item, isMobile, isReceived, showWinnerChallenges } = this.props

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
                        <p style={{ fontSize: 16, color: 'white', marginLeft: 6, marginTop: 2 }}>
                            Withdraw
                        </p>
                    </button>
                )
            }

            //non scaduta
            return (
                <div
                    style={Object.assign({}, styles.btnCta, { backgroundColor: 'transparent' })}
                >
                    <BiTimeFive
                        color='white'
                        size={20}
                    />

                    <p style={{ fontSize: 16, color: 'white', marginLeft: 6, marginTop: 2 }}>
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

                    <p style={{ fontSize: 16, color: 'white', marginLeft: 6, marginTop: 2 }}>
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
                            <p style={{ fontSize: 15, marginBottom: 4, color: "gold" }}>
                                WINNER: #{winner}
                            </p>
                        }

                        <button
                            className="btnH"
                            style={styles.btnCta}
                            onClick={() => {
                                this.props.onShowResult()
                                this.props.showWinnerChallenge(item.id)
                            }}
                        >

                            <MdOutlineReplay
                                color='white'
                                size={20}
                            />

                            <p style={{ fontSize: 16, color: 'white', marginLeft: 6, marginTop: 2 }}>
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

                    <p style={{ fontSize: 16, color: 'white', marginLeft: 6, marginTop: 2 }}>
                        Fight
                    </p>
                </button>
            )
        }
    }

	render() {
		const { item, isMobile, showWinnerChallenges } = this.props

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

                        <p style={{ fontSize: 16, color: winner === item.wiz1id ? "gold" : "white", textAlign: 'center' }}>
                            #{item.wiz1id}
                        </p>
                    </a>

                    <p style={{ fontSize: 17, color: 'white', marginLeft: 10, marginRight: 10 }}>
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
                        <p style={{ fontSize: 16, color: winner === item.wiz2id ? "gold" : "white", textAlign: 'center' }}>
                            #{item.wiz2id}
                        </p>
                    </a>

                </div>

				{
					item.amount ?
					<p style={{ fontSize: 18, color: 'white', marginBottom: 9 }}>
						KDA {item.amount}
					</p>
					:
					<p style={{ fontSize: 18, color: 'white', marginBottom: 9 }}>
                        KDA 0
					</p>
				}

                {this.renderExpiration()}

                {this.renderCta()}

                <p style={{ fontSize: 13, color: 'white' }}>
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
		borderColor: 'white',
		borderStyle: 'solid',
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
        borderRadius: 2,
        marginBottom: 3,
        borderWidth: 1,
        borderColor: 'white',
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
        borderRadius: 2,
        marginBottom: 7
    }
}

const mapStateToProps = (state) => {
	const { showWinnerChallenges } = state.challengesReducer

	return { showWinnerChallenges }
}

export default connect(mapStateToProps, {
    showWinnerChallenge
})(ChallengeItem)
