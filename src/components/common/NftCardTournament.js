import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoMedalOutline } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import getRingBonuses from './GetRingBonuses'
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
	constructor(props) {
		super(props)

		this.loadPotion = false
		this.loadRing = false

		this.state = {
			potion: undefined,
			ring: undefined,
			infoEquipment: undefined
		}
	}

	componentDidUpdate(prevProps)  {
		//console.log(prevProps.ringsEquipped, this.props.ringsEquipped);
		if (this.props.ringsEquipped.length > 0 && !this.loadRing) {
			this.loadRing = true
			this.getRingEquipped()
		}

		if (this.props.potionsEquipped.length > 0 && !this.loadPotion) {
			this.loadPotion = true
			this.getPotionEquipped()
		}
	}

	getPotionEquipped() {
		const { tournamentName, potionsEquipped, item } = this.props

		this.loadPotion = true
		//console.log(potionsEquipped);

		if (!potionsEquipped || potionsEquipped.length === 0) {
			return ""
		}

		const key = `${tournamentName}_${item.id}`
		const potion = potionsEquipped.find(i => i.key === key)
		if (potion && potion.potionEquipped) {
			this.setState({ potion: potion.potionEquipped })
		}
	}

	getRingEquipped() {
		const { ringsEquipped, item } = this.props

		//console.log(ringsEquipped);

		if (!ringsEquipped || ringsEquipped.length === 0) {
			return ""
		}

		this.loadRing = true

		const ring = ringsEquipped.find(i => i.equippedToId === item.id)
		//console.log(ring);
		if (ring && ring.equipped) {
			const infoEquipment = getRingBonuses(ring)
			this.setState({ ring, infoEquipment })
		}
	}

	render() {
		const { item, history, width, account, tournamentSeason, mainTextColor, isDarkmode, rankings } = this.props
		const { potion, ring, infoEquipment } = this.state

		//console.log(tournamentSeason);

		let totalMedals = calcMedals(item, tournamentSeason)

		//console.log(totalMedals);

		let isMine = false
		if (account.account && account.account === item.owner) {
			isMine = true
		}

		let imagePotion = vial_empty
		let descPotion = ""

		if (potion && potion === "hp") {
			imagePotion = vial_hp
			descPotion = "Vial of HP +8"
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

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				style={{ borderColor: isMine ? "#840fb2" : "#d7d7d7" }}
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

				<div style={{ justifyContent: 'space-between', width, minHeight: 73, alignItems: 'center' }}>

					<div style={{ flex: 0.8, flexDirection: 'column', justifyContent: 'space-between', marginTop: 5 }}>
						{
							item.nickname ?
							<p style={{ color: mainTextColor, fontSize: 13, marginLeft: 10, marginRight: 3, minHeight: 30, overflowWrap: 'anywhere' }} className="text-bold">
								<span style={{ fontSize: 13 }}>{item.name}</span> {item.nickname}
							</p>
							:
							<p style={{ color: mainTextColor, fontSize: 14, marginLeft: 10, minHeight: 30 }} className="text-bold">
								{item.name}
							</p>
						}

						<div style={{ alignItems: 'center', marginLeft: 10, height: 28 }}>
							<p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
								level
							</p>

							<p style={{ color: getColorTextBasedOnLevel(item.level, isDarkmode), fontSize: 17 }} className="text-bold">
								{item.level}
							</p>
						</div>

						{
							score &&
							<p style={{ fontSize: 15, color: mainTextColor, marginTop: 3, marginBottom: 5, marginLeft: 10 }}>
								Rating {score}
							</p>
						}
					</div>

					<div style={{ flex: 0.2, flexDirection: 'column', justifyContent: 'space-between', marginTop: 5, marginRight: 10 }}>
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
							<IoMedalOutline
								color={mainTextColor}
								size={20}
								style={{ marginRight: 8 }}
							/>

							<p style={{ color: mainTextColor, fontSize: 16 }}>
								{totalMedals}
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
										{ring.name} : {infoEquipment.bonusesText.join(", ")}
									</div>
								</Popup>
								: null
							}

							{
								potion ?
								<Popup
									trigger={open => (
										<div style={{ alignItems: 'center', marginLeft: 5 }}>
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
