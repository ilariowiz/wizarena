import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment'
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'


class NftCardBurningQueue extends Component {
	render() {
		const { item, history, width, reveal } = this.props

		const from = moment(item.timestamp.timep).fromNow()

		return (
			<div
				className='container'
				onClick={() => history.push(`/nft/${item.idnft}`)}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.idnft, reveal)}
					alt={`#${item.idnft}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 55, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
						<p style={{ color: 'white', fontSize: 19, marginLeft: 10, lineHeight: 1 }}>
							#{item.idnft}
						</p>

						<div style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
							<p style={{ color: 'white', fontSize: 16, marginRight: 10, lineHeight: 1 }}>
								IN QUEUE
							</p>

							<p style={{ color: '#c2c0c0', fontSize: 14, marginRight: 10, lineHeight: 1 }}>
								{from}
							</p>
						</div>

					</div>

				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	const { reveal } = state.mainReducer

	return { reveal }
}

export default connect(mapStateToProps)(NftCardBurningQueue);
