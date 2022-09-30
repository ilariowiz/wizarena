import React, { Component } from 'react';
import { connect } from 'react-redux'
import { doc, getDoc } from "firebase/firestore";
import { firebasedb } from '../Firebase';
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'

const logoKda = require('../../assets/kdalogo2.png')

class NftCard extends Component {
	render() {
		const { item, history, width, reveal } = this.props

		return (
			<div
				className='container'
				onClick={() => history.push(`/nft/${item.id}`)}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id, reveal)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 55, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
						<p style={{ color: 'white', fontSize: 19, marginLeft: 10, lineHeight: 1 }}>
							{item.name}
						</p>
					</div>

					{
						item.listed ?
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5, marginRight: 10 }}>
							<p style={{ color: '#c2c0c0', fontSize: 14, lineHeight: 1 }}>
								PRICE
							</p>

							<div style={{ marginLeft: 10, alignItems: 'center' }}>

								<img
									style={{ width: 19, marginRight: 6, objectFit: 'contain', marginBottom: 6 }}
									src={logoKda}
									alt='Kadena logo'
								/>

								<p style={{ color: 'white', fontSize: 20, marginBottom: 2, lineHeight: 1 }}>
									{item.price}
								</p>
							</div>
						</div>
						: null
					}

				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	const { reveal } = state.mainReducer

	return { reveal }
}

export default connect(mapStateToProps)(NftCard);
