import React, { Component } from 'react';
import { connect } from 'react-redux'
import getImageUrl from './GetImageUrl'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import '../../css/NftCard.css'
import {
	selectWizard
} from '../../actions'

const logoKda = require('../../assets/kdalogo2.png')

class NftCard extends Component {
	render() {
		const { item, history, width, mainTextColor } = this.props

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
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

				<div style={{ flexDirection: 'column', justifyContent: 'center', width, height: 65, alignItems: 'center' }}>

					<div style={{ width: '100%', marginBottom: 5 }}>

						{
							item.nickname ?
							<p style={{ color: mainTextColor, fontSize: 13, marginLeft: 10 }} className="text-medium">
								{item.name} {item.nickname}
							</p>
							:
							<p style={{ color: mainTextColor, fontSize: 14, marginLeft: 10 }} className="text-medium">
								{item.name}
							</p>
						}
					</div>

					<div style={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
						{
							item.level &&
							<div style={{ alignItems: 'center', marginLeft: 10 }}>
								<p style={{ color: mainTextColor, fontSize: 13, marginRight: 10 }}>
									Level
								</p>

								<p style={{ color: mainTextColor, fontSize: 15 }} className="text-medium">
									{item.level}
								</p>
							</div>
						}

						{
							item.listed ?
							<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginRight: 10 }}>
								<div style={{ alignItems: 'center' }}>

									<img
										style={{ width: 14, marginRight: 6, objectFit: 'contain' }}
										src={logoKda}
										alt='Kadena logo'
									/>

									<p style={{ color: mainTextColor, fontSize: 17 }} className="text-bold">
										{item.price}
									</p>
								</div>
							</div>
							: null
						}
					</div>

				</div>
			</a>
		)
	}
}

const mapStateToProps = (state) => {
	const { mainTextColor } = state.mainReducer

	return { mainTextColor }
}

export default connect(mapStateToProps, {
	selectWizard
})(NftCard)
