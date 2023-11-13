import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import moment from 'moment'
import '../../css/Modal.css'
import { CTA_COLOR } from '../../actions/types'


class ModalFightsFlashTournament extends Component {

	getLinkForReplay(item) {
		const { tournamentInfo } = this.props

		//console.log(tournamentInfo);

		const completedAt = moment(tournamentInfo.completedAt.timep)
		const updateDate = moment("18/09/2023 14:00:00", "DD/MM/YYYY HH:mm:ss")

		//console.log(updateDate, completedAt, updateDate > completedAt);

		let link = `${window.location.protocol}//${window.location.host}/fight/${item.fightId}`

		if (updateDate < completedAt) {
			link = `${window.location.protocol}//${window.location.host}/fightreplay/fights/${item.fightId}`
		}

		return link
	}

	renderFightBrawl(item, index, width) {
		const { mainTextColor, isDarkmode } = this.props

		const imgWidth = width || 60

		const link = `${window.location.protocol}//${window.location.host}/fightreplaybrawl/fights/${item.fightId}`

		return (
			<a
				key={index}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				style={Object.assign({}, styles.boxFight, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", flexWrap: 'wrap' })}
			>
				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s1)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s1}
					/>

					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s1}
					</p>
				</div>

				<p style={{ fontSize: 13, color: mainTextColor, marginRight: 8, marginLeft: 8 }}>
					VS
				</p>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s2)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s2}
					/>
					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s2}
					</p>
				</div>

				<p style={{ fontSize: 13, color: mainTextColor, marginRight: 8, marginLeft: 8 }}>
					VS
				</p>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s3)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s3}
					/>
					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s3}
					</p>
				</div>

				<p style={{ fontSize: 13, color: mainTextColor, marginRight: 8, marginLeft: 8 }}>
					VS
				</p>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s4)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s4}
					/>
					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s4}
					</p>
				</div>
			</a>
		)
	}

	renderFight(item, index, showHorizontal, width) {
		const { mainTextColor, isDarkmode } = this.props

		const imgWidth = width || 60

		const link = this.getLinkForReplay(item)

		return (
			<a
				key={index}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				style={Object.assign({}, styles.boxFight, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", flexDirection: showHorizontal ? 'column' : 'row' })}
			>
				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s1)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s1}
					/>

					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s1}
					</p>
				</div>

				<p style={{ fontSize: 13, color: mainTextColor, marginRight: 8, marginLeft: 8 }}>
					VS
				</p>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s2)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s2}
					/>
					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s2}
					</p>
				</div>
			</a>
		)
	}

	renderFightMobile(item, index, showHorizontal, width) {
		const { mainTextColor, isDarkmode, tournamentInfo } = this.props

		const imgWidth = width || 40

		const link = this.getLinkForReplay(item)

		return (
			<a
				key={index}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				style={Object.assign({}, styles.boxFight, { backgroundColor: isDarkmode ? "rgb(242 242 242 / 9%)" : "#f2f2f2", flexDirection: showHorizontal ? 'row' : 'column' })}
			>
				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s1)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s1}
					/>

					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s1}
					</p>
				</div>

				<p style={{ fontSize: 13, color: mainTextColor, marginRight: 8, marginLeft: 8 }}>
					VS
				</p>

				<div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
					<img
						src={getImageUrl(item.s2)}
						style={{ width: imgWidth, height: imgWidth, borderRadius: imgWidth/2, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
						alt={item.s2}
					/>
					<p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }} className="text-medium">
						#{item.s2}
					</p>
				</div>
			</a>
		)
	}

	render() {
		const { showModal, fights, tournamentInfo, isMobile, mainTextColor, mainBackgroundColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		if (!tournamentInfo.id) {
			return <div />
		}

		const tournamentid = tournamentInfo.id

		let howManyFights = 3 //8 players
		let widthImg = isMobile ? 40 : 60
		if (tournamentInfo.nPlayers.int === 4) {
			if (tournamentInfo.type && tournamentInfo.type === "brawl") {
				howManyFights = 1
				widthImg = isMobile ? 40 : 60
			}
			else {
				howManyFights = 2
			}
		}
		else if (tournamentInfo.nPlayers.int === 16) {
			howManyFights = 4
			widthImg = isMobile ? 22 : 42
		}
		else if (tournamentInfo.nPlayers.int === 2) {
			howManyFights = 1
		}


		//console.log(howManyFights, tournamentInfo);


		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width: '90%', maxHeight: '85%', backgroundColor: mainBackgroundColor, overflowY: 'auto', overflowX: 'hidden' })}>

					<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 25 }}>
						{
							fights && fights[`${tournamentid}_r1`].map((item, index) => {
								if (tournamentInfo.type && tournamentInfo.type === "brawl") {
									return this.renderFightBrawl(item, index, widthImg)
								}
								if (isMobile) {
									return this.renderFightMobile(item, index, howManyFights === 1 ? true : false, widthImg)
								}
								return this.renderFight(item, index, howManyFights === 4 ? true : false, widthImg)
							})
						}
					</div>

					{
						howManyFights >= 2 &&
						<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 15 }}>
							{
								fights && fights[`${tournamentid}_r2`].map((item, index) => {
									if (isMobile) {
										return this.renderFightMobile(item, index, howManyFights === 2 ? true : false)
									}
									return this.renderFight(item, index)
								})
							}
						</div>
					}

					{
						howManyFights >= 3 &&
						<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 25 }}>
							{
								fights && fights[`${tournamentid}_r3`].map((item, index) => {
									if (isMobile) {
										return this.renderFightMobile(item, index, true)
									}
									return this.renderFight(item, index)
								})
							}
						</div>
					}

					{
						howManyFights === 4 &&
						<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', marginBottom: 25 }}>
							{
								fights && fights[`${tournamentid}_r4`].map((item, index) => {
									if (isMobile) {
										return this.renderFightMobile(item, index, true)
									}
									return this.renderFight(item, index)
								})
							}
						</div>
					}

					<a
						href={`${window.location.protocol}//${window.location.host}/nft/${fights.winner}`}
						style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
						onClick={(e) => {
							e.preventDefault()
							this.props.history.push(`/nft/${fights.winner}`)
						}}
					>
						<img
							src={getImageUrl(fights.winner)}
							style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid', marginBottom: 4 }}
							alt={fights.winner}
						/>

						<p style={{ fontSize: 15, color: mainTextColor, marginBottom: 20 }} className="text-bold">
							#{fights.winner}
						</p>
					</a>

                    <button
                        className='btnH'
                        style={styles.btnClose}
                        onClick={() => this.props.onCloseModal()}
                    >
                        <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
                            Close
                        </p>
                    </button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
		paddingTop: 20,
		paddingBottom: 20
	},
	btnClose: {
		width: 120,
		height: 34,
		minHeight: 34,
		backgroundColor: CTA_COLOR,
		borderRadius: 4,
	},
	boxFight: {
		cursor: 'pointer',
		padding: 5,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		display: 'flex',
		borderRadius: 4
	}
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer

	return { mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps)(ModalFightsFlashTournament);
