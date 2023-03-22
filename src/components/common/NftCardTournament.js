import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoMedalOutline } from 'react-icons/io5'
import Popup from 'reactjs-popup';
import getRingBonuses from './GetRingBonuses'
import getImageUrl from './GetImageUrl'
import calcMedals from './CalcMedals'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
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

		this.setState({ potion: potion.potionEquipped })
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
		const { item, history, width, account, tournamentSeason } = this.props
		const { potion, ring, infoEquipment } = this.state

		//console.log(tournamentSeason);

		let totalMedals = calcMedals(item, tournamentSeason)

		//console.log(totalMedals);

		let isMine = false
		if (account.account && account.account === item.owner) {
			isMine = true
		}

		const level = calcLevelWizard(item)

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


		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				style={{ borderColor: isMine ? "gold" : "white" }}
				onClick={(e) => {
					e.preventDefault()
					this.props.selectWizard(item.id)
					history.push(`/nft/${item.id}`)
				}}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 73, alignItems: 'center' }}>

					<div style={{ flex: 0.8, flexDirection: 'column', justifyContent: 'space-between', marginTop: 5 }}>
						{
							item.nickname ?
							<p style={{ color: isMine ? "gold" : "white", fontSize: 16, marginLeft: 10, lineHeight: 1 }}>
								<span style={{ fontSize: 13 }}>{item.name}</span> {item.nickname}
							</p>
							:
							<p style={{ color: isMine ? "gold" : "white", fontSize: 18, marginLeft: 10, lineHeight: 1, marginBottom: 4 }}>
								{item.name}
							</p>
						}

						<div style={{ alignItems: 'center', marginLeft: 10, height: 28 }}>
							<p style={{ color: "#c2c0c0", fontSize: 15, marginRight: 10 }}>
								LEVEL
							</p>

							<p style={{ color: getColorTextBasedOnLevel(level), fontSize: 18 }}>
								{level}
							</p>
						</div>
					</div>

					<div style={{ flex: 0.2, flexDirection: 'column', justifyContent: 'space-between', marginTop: 5, marginRight: 10 }}>
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 4 }}>
							<IoMedalOutline
								color={isMine ? "gold" : "white"}
								size={20}
								style={{ marginRight: 8 }}
							/>

							<p style={{ color: isMine ? "gold" : "white", fontSize: 18, lineHeight: 1 }}>
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
									<div style={{ padding: 5, fontSize: 18 }}>
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
									<div style={{ padding: 5, fontSize: 18 }}>
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
	const { account } = state.mainReducer

	return { account }
}

export default connect(mapStateToProps, {
	selectWizard
})(NftCardTournament);
