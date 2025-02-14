import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import titles from './common/LeagueTitle'
import { TEXT_SECONDARY_COLOR } from '../actions/types'


class HallOfFame extends Component {
    constructor(props) {
        super(props)

        this.state = {
            wizards: [],
        }
    }

    componentDidMount() {
		document.title = "Hall of Fame - Wizards Arena"

        this.loadWizards()
	}

    loadWizards() {
        //console.log(titles);

        let wizards = []

        for (const [key, value] of Object.entries(titles)) {
            const obj = {id: key, titles: value}
            wizards.push(obj)
        }

        wizards.sort((a,b) => {
            return b.titles.length - a.titles.length
        })

        //console.log(wizards);
        this.setState({ wizards })
    }

    renderTitle(item, index) {
        const { mainTextColor } = this.props

        return (
            <div style={{ alignItems: 'center', flexDirection: 'column', height: 'fit-content', maxWidth: 70, padding: 3, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: mainTextColor, borderStyle: 'solid', borderRadius: 4 }} key={index}>
                <img
                    style={{ width: 30, height: 30 }}
                    src={item.img}
                    alt="Cup"
                />

                <p style={{ fontSize: 12, color: item.textColor, textAlign: 'center' }}>
                    {item.title}
                </p>
            </div>
        )
    }

    renderWizard(item, index) {
        const { mainTextColor } = this.props
        return (
            <div
                key={index}
                style={{ marginRight: 20, marginBottom: 20, flexDirection: 'row' }}
            >
                <a
                    style={{ flexDirection: 'column', marginBottom: 10, marginRight: 10, cursor: 'pointer' }}
                    href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        style={{ width: 140, height: 140, borderRadius: 4, marginBottom: 3, borderWidth: 1, borderColor: '#d7d7d7', borderStyle: 'solid' }}
                        src={getImageUrl(item.id)}
                        alt={`#${item.id}`}
                    />
                    <p style={{ color: mainTextColor, fontSize: 14 }}>
                        #{item.id}
                    </p>
                </a>

                <div style={{ flexWrap: 'wrap' }}>
                    {item.titles.map((i, idx) => {
                        return this.renderTitle(i, idx)
                    })}
                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { wizards } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', textAlign: 'center', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 26, marginBottom: 20 }} className="text-bold">
                    Hall of Fame
                </p>

                <div style={{ width: '100%', flexWrap: 'wrap' }}>
                    {wizards.map((item, index) => {
                        return this.renderWizard(item, index)
                    })}
                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='home'
					section={16}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
}

const mapStateToProps = (state) => {
    const { mainTextColor, mainBackgroundColor } = state.mainReducer

    return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(HallOfFame)
