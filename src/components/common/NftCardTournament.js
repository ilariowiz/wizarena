import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoMedalOutline } from 'react-icons/io5'
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'


class NftCardTournament extends Component {
	render() {
		const { item, history, width, reveal, account } = this.props

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

		return (
			<div
				className='container'
				style={{ borderColor: isMine ? "gold" : "white" }}
				onClick={() => history.push(`/nft/${item.id}`)}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id, reveal)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 55, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
						<p style={{ color: isMine ? "gold" : "white", fontSize: 19, marginLeft: 10, lineHeight: 1 }}>
							{item.name}
						</p>
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
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	const { reveal, account } = state.mainReducer

	return { reveal, account }
}

export default connect(mapStateToProps)(NftCardTournament);