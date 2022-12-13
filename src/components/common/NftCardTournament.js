import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoMedalOutline } from 'react-icons/io5'
import getImageUrl from './GetImageUrl'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import '../../css/NftCard.css'


class NftCardTournament extends Component {
	render() {
		const { item, history, width, account } = this.props

		//console.log(item);

		let totalMedals = 0
		if (Object.keys(item.medals).length > 0) {
			const arrayValueMedals = Object.values(item.medals)
			arrayValueMedals.map(i => totalMedals = totalMedals + parseInt(i))
		}

		//console.log(totalMedals);

		let isMine = false
		if (account.account && account.account === item.owner) {
			isMine = true
		}

		const level = calcLevelWizard(item)

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				style={{ borderColor: isMine ? "gold" : "white" }}
				onClick={(e) => {
					e.preventDefault()
					history.push(`/nft/${item.id}`)
				}}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 55, alignItems: 'center' }}>

					<div style={{ width: '100%', flexDirection: 'column', justifyContent: 'space-between', marginTop: 5 }}>
						<p style={{ color: isMine ? "gold" : "white", fontSize: 19, marginLeft: 10, lineHeight: 1 }}>
							{item.name}
						</p>

						<div style={{ alignItems: 'center', marginLeft: 10 }}>
							<p style={{ color: "#c2c0c0", fontSize: 15, marginRight: 10 }}>
								LEVEL
							</p>

							<p style={{ color: getColorTextBasedOnLevel(level), fontSize: 18 }}>
								{level}
							</p>
						</div>
					</div>

					<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5, marginRight: 10 }}>
						<IoMedalOutline
							color={isMine ? "gold" : "white"}
							size={22}
							style={{ marginRight: 8 }}
						/>

						<p style={{ color: isMine ? "gold" : "white", fontSize: 20, lineHeight: 1 }}>
							{totalMedals}
						</p>
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

export default connect(mapStateToProps)(NftCardTournament);
