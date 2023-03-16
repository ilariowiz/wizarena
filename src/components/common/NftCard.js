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
		const { item, history, width } = this.props

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
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 65, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'column', flex: item.listed ? 0.7 : 1 }}>
						{
							item.nickname ?
							<p style={{ color: 'white', fontSize: 16, marginLeft: 10, lineHeight: 1 }}>
								{item.name} {item.nickname}
							</p>
							:
							<p style={{ color: 'white', fontSize: 18, marginLeft: 10, lineHeight: 1 }}>
								{item.name}
							</p>
						}

						{
							item.level &&
							<div style={{ alignItems: 'center', marginLeft: 10, marginTop: 5 }}>
								<p style={{ color: "#c2c0c0", fontSize: 14, marginRight: 10 }}>
									LEVEL
								</p>

								<p style={{ color: getColorTextBasedOnLevel(item.level), fontSize: 17 }}>
									{item.level}
								</p>
							</div>
						}
					</div>

					{
						item.listed ?
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5, marginRight: 10, flex: 0.3 }}>
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
			</a>
		)
	}
}

export default connect(null, {
	selectWizard
})(NftCard)
