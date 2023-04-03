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
			<p style={{ fontSize: isMobile ? 14 : 17, marginRight: 5, color: 'white', marginLeft: 10 }}>
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
                            <p style={{ fontSize: 15, marginBottom: 4, color: "white" }}>
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
		const { item, isMobile } = this.props

		return (
			<div style={styles.container}  key={item.id}>

                <div style={{ alignItems: 'center', marginLeft: 10, marginBottom: isMobile ? 5 : 0 }}>

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

                        <p style={{ fontSize: 17, color: 'white', textAlign: 'center', marginLeft: 5 }}>
                            #{item.wiz1id}
                        </p>
                    </a>

                    <p style={{ fontSize: 17, color: 'white', marginLeft: 15, marginRight: 15 }}>
                        VS
                    </p>

                    <a
                        href={`${window.location.protocol}//${window.location.host}/nft/${item.wiz2id}`}
                        style={Object.assign({}, styles.btnImage, { alignItems: 'flex-end' })}
                        className="btnH"
                        onClick={(e) => {
                            e.preventDefault()
                            this.props.history.push(`./nft/${item.wiz2id}`)
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white', textAlign: 'center', marginRight: 5 }}>
                            #{item.wiz2id}
                        </p>
                        <img
                            src={getImageUrl(item.wiz2id)}
                            style={styles.img}
                        />
                    </a>

                </div>

				{
					item.amount ?
					<p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
						KDA {item.amount}
					</p>
					:
					<p style={{ fontSize: 18, color: 'white', marginRight: 10 }}>
                        KDA 0
					</p>
				}

                {this.renderExpiration()}

                {this.renderCta()}

			</div>
		)
	}
}

const styles = {
	container: {
		justifyContent: 'space-between',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'white',
		borderStyle: 'solid',
		width: '100%',
        flexWrap: 'wrap',
        marginBottom: 15,
        paddingTop: 10,
        paddingBottom: 10
	},
    btnImage: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        cursor: 'pointer'
    },
    img: {
        width: 70,
        height: 70,
        borderRadius: 2,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'white',
        borderStyle: 'solid',
    },
    btnCta: {
        backgroundColor: CTA_COLOR,
        width: 120,
        height: 40,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
        marginRight: 10,
        marginLeft: 10
    }
}

const mapStateToProps = (state) => {
	const { showWinnerChallenges } = state.challengesReducer

	return { showWinnerChallenges }
}

export default connect(mapStateToProps, {
    showWinnerChallenge
})(ChallengeItem)
