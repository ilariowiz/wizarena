import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoSettingsOutline } from 'react-icons/io5'
import getBoxWidth from './common/GetBoxW'
import '../css/Header.css'
import {
	loadUser
} from '../actions'
import { TEXT_SECONDARY_COLOR } from '../actions/types'

const logo_img = require('../assets/wiz_logo.png')


class Header extends Component {
	render() {
		const { section, account, page, isMobile } = this.props

		const { boxW } = getBoxWidth(isMobile)

		let margin = isMobile ? 12 : 22

		let viewAccountStyle = isMobile ?
								{ width: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' }
								:
								{ height: 60, flexDirection: 'row', alignItems: 'flex-end',  justifyContent: 'flex-end' }

		let btnPressedStyle = isMobile ? 'btnPressedMobile' : 'btnPressed'
		let btnStyle = isMobile ? 'btnMobile' : 'btn'

		let btnHeaderNft = isMobile ? 'btnPressedBlackMobile' : 'btnPressedBlack'

		const hinside = isMobile ? { flexDirection: 'column', justifyContent: 'space-around', width: boxW } : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: boxW }

		return (
			<div className={isMobile ? 'homeheaderMobile' : 'homeheader'}>

				<div style={hinside}>
					<div style={{ alignItems: 'flex-end' }}>

						<img
							src={logo_img}
							style={{ height: isMobile ? 30 : 58, borderRadius: 2, marginRight: margin, cursor: 'pointer' }}
							alt='Wizards'
							onClick={() => this.props.history.replace('/collection')}
						/>

						{
							page === 'home' ?
							<div style={{ height: 60, alignItems: 'flex-end', flexWrap: 'wrap' }}>
								<p
									className={section === 1 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/collection')}
								>
									COLLECTION
								</p>

								{/*
								<p
									className={section === 2 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/mint')}
								>
									MINT
								</p>
								*/}

								<p
									className={section === 2 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/sales')}
								>
									SALES
								</p>

								<p
									className={section === 3 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/me')}
								>
									PROFILE
								</p>

								<p
									className={section === 5 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/magicshop')}
								>
									MAGIC SHOP
								</p>

								<p
									className={section === 4 ? btnPressedStyle : btnStyle}
									onClick={() => this.props.history.replace('/tournament')}
								>
									TOURNAMENT
								</p>
							</div>
							: null
						}

						{
							page === 'nft' || page === 'settings' ?
							<div>
								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/collection')}
								>
									HOME
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/me')}
								>
									PROFILE
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/magicshop')}
								>
									MAGIC SHOP
								</p>

								<p
									className={btnHeaderNft}
									onClick={() => this.props.history.replace('/tournament')}
								>
									TOURNAMENT
								</p>
							</div>
							:
							null
						}

					</div>

					<div style={viewAccountStyle}>
						{
							account && account.account ?
							<p style={{ color: TEXT_SECONDARY_COLOR, fontSize: 15, marginRight: isMobile ? 8 : 22, lineHeight: 1 }}>
								{account.account.slice(0, 15)}...
							</p>
							: null
						}

						{
							account && account.account && page !== 'settings' ?
							<button
								onClick={() => {
									this.props.history.push('/settings')
								}}
								style={{ marginRight: isMobile ? 12 : 0, display: 'flex', alignItems: 'flex-end' }}
							>
								<IoSettingsOutline
									color={TEXT_SECONDARY_COLOR}
									size={24}
								/>
							</button>
							: null
						}
					</div>
				</div>
			</div>
		)
	}
}

export default connect(null, {
	loadUser
})(Header);
