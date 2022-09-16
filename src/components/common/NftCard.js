import React, { Component } from 'react';
import { connect } from 'react-redux'
import { doc, getDoc } from "firebase/firestore";
import { firebasedb } from '../Firebase';
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'

const logoKda = require('../../assets/kdalogo2.png')

class NftCard extends Component {
	constructor(props) {
		super(props)

		this.state = {
			rank: undefined
		}
	}

	componentDidMount() {
		const { reveal } = this.props
		if (parseInt(reveal) > 0) {
			this.loadRank()
		}
	}

	async loadRank() {
		const { item } = this.props

		const docRef = doc(firebasedb, "ranking", item.id)

		const docSnap = await getDoc(docRef)
		const data = docSnap.data()

		this.setState({ rank: data.traitsRank })
	}

	render() {
		const { item, history, width, reveal } = this.props
		const { rank } = this.state

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

				<div style={{ flexDirection: 'column', width, height: 75, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, marginBottom: 5 }}>
						<p style={{ color: 'white', fontSize: 17, fontWeight: '500', marginLeft: 10, lineHeight: 1 }}>
							{item.name}
						</p>

						{
							rank ?
							<p style={{ fontSize: 15, color: '#c2c0c0', marginRight: 10, lineHeight: 1 }}>
								Rank {rank}
							</p>
							:
							null
						}

					</div>

					{
						item.listed ?
						<div style={{ flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}>
							<p style={{ color: '#c2c0c0', fontSize: 14, marginLeft: 10, marginTop: 5, marginBottom: 2, lineHeight: 1 }}>
								Price
							</p>

							<div style={{ marginLeft: 10 }}>

								<img
									style={{ width: 14, height: 14, marginRight: 8, objectFit: 'contain' }}
									src={logoKda}
									alt='Kadena logo'
								/>

								<p style={{ color: 'white', fontSize: 18, fontWeight: '700', lineHeight: 1 }}>
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
