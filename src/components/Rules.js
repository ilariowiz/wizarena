import React, { Component } from 'react'
import Media from 'react-media';
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import { TEST_NET_ID, BACKGROUND_COLOR, CTA_COLOR, TEXT_SECONDARY_COLOR } from '../actions/types'

class Rules extends Component {
    componentDidMount() {
		document.title = "Rules - Wizards Arena"
	}

    renderBody(isMobile) {
        const boxW = Math.floor(window.innerWidth * (isMobile ? 85 : 70) / 100)

        return (
            <div style={{ width: boxW, alignItems: 'center', flexDirection: 'column', paddingTop: 30 }}>
                <p style={{ fontSize: 28, color: 'white', marginBottom: 30 }}>
                    Rules
                </p>

                <div style={{ width: '100%' }}>
                    <p style={{ fontSize: 18, color: 'white' }}>
                        Welcome to Wizards Arena!
                    </p>
                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={4}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
    container: {
		flexDirection: 'column',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
}

export default Rules
