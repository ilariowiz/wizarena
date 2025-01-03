import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoMedalOutline } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import getImageUrl from './GetImageUrl'
import calcMedals from './CalcMedals'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import '../../css/NftCard.css'
import 'reactjs-popup/dist/index.css';
import {
	selectWizard
} from '../../actions'

const vial_hp = require('../../assets/vial_hp.png')
const vial_def = require('../../assets/vial_def.png')
const vial_atk = require('../../assets/vial_atk.png')
const vial_dmg = require('../../assets/vial_dmg.png')
const vial_speed = require('../../assets/vial_speed.png')
const vial_empty = require('../../assets/vial_empty.png')


class NftCardTournament extends Component {
	render() {
		const { item, history, width, account, tournamentSeason, mainTextColor, isDarkmode, rankings, potion, ring, pendant, tournamentInfo } = this.props

		//console.log(tournamentSeason);

		let totalMedals = calcMedals(item, tournamentSeason, tournamentInfo.showLeague)

		let isMine = false
		if (account.account && account.account === item.owner) {
			isMine = true
		}

		let imagePotion = vial_empty
		let descPotion = ""

		if (potion && potion === "hp") {
			imagePotion = vial_hp
			descPotion = "Vial of HP +10"
		}
		else if (potion && potion === "defense") {
			imagePotion = vial_def
			descPotion = "Vial of Defense +2"
		}
		else if (potion && potion === "attack") {
			imagePotion = vial_atk
			descPotion = "Vial of Attack +2"
		}
		else if (potion && potion === "damage") {
			imagePotion = vial_dmg
			descPotion = "Vial of Damage +4"
		}
		else if (potion && potion === "speed") {
			imagePotion = vial_speed
			descPotion = "Vial of Speed +4"
		}

		let score;
		if (rankings && rankings.length > 0) {
			let rankingItem = rankings.find(i => i.id === item.id)
			if (!rankingItem) {
				score = 500
			}
			else {
				score = rankingItem.ranking
			}
		}

		let borderMineColor = isDarkmode ? "gold" : "#840fb2"

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				style={{ borderColor: isMine ? borderMineColor : "#d7d7d7", position: 'relative' }}
				onClick={(e) => {
					e.preventDefault()
					this.props.selectWizard(item.id)
					history.push(`/nft/${item.id}`)
				}}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				{
					score &&
					<div style={{ position: 'absolute', right: 0, top: width - 20, backgroundColor: 'white', height: 20, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 4, paddingLeft: 8, paddingRight: 8 }}>
						<p style={{ fontSize: 15, color: 'black' }} className="text-medium">
							elo {score}
						</p>
					</div>
				}

				<div style={{ justifyContent: 'space-between', flexDirection: 'column', width, minHeight: 73, alignItems: 'center' }}>

					<div style={{ alignItems: 'center', justifyContent: 'space-between', width: width-20, marginTop: 5, marginBottom: 5 }}>
						{
							item.nickname ?
							<p style={{ color: mainTextColor, fontSize: 13, marginRight: 3, width: '100%', overflowWrap: 'anywhere' }} className="text-bold">
								<span style={{ fontSize: 13 }}>{item.name}</span> {item.nickname}
							</p>
							:
							<p style={{ color: mainTextColor, fontSize: 14, marginRight: 3, width: '100%' }} className="text-bold">
								{item.name}
							</p>
						}

						{
							totalMedals ?
							<div style={{ alignItems: 'center', justifyContent: 'flex-end', minHeight: 30 }}>
								<IoMedalOutline
									color={mainTextColor}
									size={20}
									style={{ marginRight: 8 }}
								/>

								<p style={{ color: mainTextColor, fontSize: 16 }}>
									{totalMedals}
								</p>
							</div>
							:
							<div style={{ alignItems: 'center', justifyContent: 'flex-end', minHeight: 30, width: 38 }} />
						}

					</div>


					<div style={{ alignItems: 'center', justifyContent: 'space-between', width: width-20, marginBottom: 5 }}>

						<div style={{ alignItems: 'center', height: 28 }}>
							<p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
								level
							</p>

							<p style={{ color: getColorTextBasedOnLevel(item.level, isDarkmode), fontSize: 17 }} className="text-bold">
								{item.level}
							</p>
						</div>

						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', height: 28 }}>

							{
								ring ?
								<Popup
									trigger={open => (
										<div style={{ alignItems: 'center' }}>
											<img
												src={ring.url}
												style={{ width: 32, height: 32 }}
												alt={`Ring Equipped: ${ring.name}`}
											/>
										</div>
									)}
									position="top center"
									on="hover"
								>
									<div style={{ padding: 5, fontSize: 16, color: "#1d1d1f" }}>
										{ring.name}
									</div>
								</Popup>
								: null
							}

							{
								pendant ?
								<Popup
									trigger={open => (
										<div style={{ alignItems: 'center' }}>
											<img
												src={pendant.url}
												style={{ width: 32, height: 32 }}
												alt={`Pendant Equipped: ${pendant.name}`}
											/>
										</div>
									)}
									position="top center"
									on="hover"
								>
									<div style={{ padding: 5, fontSize: 16, color: "#1d1d1f" }}>
										{pendant.name}
									</div>
								</Popup>
								: null
							}

							{
								potion ?
								<Popup
									trigger={open => (
										<div style={{ alignItems: 'center' }}>
											<img
					                            src={imagePotion}
					                            style={{ width: 24, height: 28 }}
					                            alt={`Potion Equipped: ${potion ? potion.toUpperCase() : "None"}`}
					                        />

										</div>
									)}
									position="top center"
									on="hover"
								>
									<div style={{ padding: 5, fontSize: 16, color: "#1d1d1f" }}>
										{descPotion}
									</div>
								</Popup>
								: null
							}

						</div>

					</div>

					{
						item.level > tournamentInfo.levelCap &&
						<div style={{ alignItems: 'center', justifyContent: 'space-between', width: width-20, marginBottom: 5 }}>
							<p style={{ fontSize: 14, color: 'red' }}>
								Disqualified
							</p>

							<p style={{ fontSize: 13, color: 'red' }}>
								Level Cap {tournamentInfo.levelCap}
							</p>
						</div>
					}

				</div>
			</a>
		)
	}
}

const mapStateToProps = (state) => {
	const { account, mainTextColor, isDarkmode } = state.mainReducer

	return { account, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps, {
	selectWizard
})(NftCardTournament);
