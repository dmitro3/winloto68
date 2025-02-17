import React from 'react';
import BaseComponent from '@/model/BaseComponent'
import UserContactForm from '@/module/form/UserContactForm/Container'
import ProfilePopup from '@/module/profile/OverviewPopup/Container'
import moment from 'moment-timezone'
import Comments from '@/module/common/comments/Container'
import {Col, Row, Tabs, Icon, Button, Spin, Table, Tooltip, Tag, Modal} from 'antd'
import I18N from '@/I18N'
import {TASK_CATEGORY, TASK_TYPE, TASK_STATUS, TASK_CANDIDATE_STATUS,
    USER_ROLE, USER_AVATAR_DEFAULT, TEAM_TYPE,LINKIFY_OPTION} from '@/constant'
import './style.scss'
import config from '@/config'
import MediaQuery from 'react-responsive'
import _ from 'lodash'
import linkifyStr from 'linkifyjs/string';

const TabPane = Tabs.TabPane
const dateTimeFormat = 'MMM D, YYYY - h:mma (Z [GMT])'

export default class extends BaseComponent {

    ord_states() {
        return {
            showUserInfo: null
        }
    }

    async componentDidMount() {
        this.props.getMember(this.props.match.params.userId || this.props.currentUserId)
        this.props.getUserTeams(this.props.match.params.userId || this.props.currentUserId)
        // this.props.getTasks(this.props.match.params.userId || this.props.currentUserId)
    }

    componentWillUnmount() {
        this.props.resetMemberDetail()
        this.props.resetTeams()
        // this.props.resetTasks()
    }

    // TODO: add twitter, telegram, linkedIn, FB
    ord_render () {
        if (this.props.loading || _.isEmpty(this.props.member)) {
            return (
                <div className="flex-center spin-container">
                    <Spin size="large" />
                </div>
            )
        }
        let roleName = this.props.member.role
        if (roleName === USER_ROLE.LEADER) {
            roleName = 'ORGANIZER'
        }

        return (
            <div className="c_Member public">
                <MediaQuery maxWidth={800}>
                    <div className="member-content member-content-mobile">
                        {this.renderMobile()}
                    </div>
                </MediaQuery>
                <MediaQuery minWidth={801}>
                    <div className="member-content">
                        {this.renderDesktop()}
                    </div>
                </MediaQuery>
                <Modal
                    className="profile-overview-popup-modal"
                    visible={!!this.state.showUserInfo}
                    onCancel={this.handleCancelProfilePopup.bind(this)}
                    footer={null}>
                    { this.state.showUserInfo &&
                        <ProfilePopup close={this.handleCancelProfilePopup.bind(this)}
                            member={this.state.showUserInfo} showSendMessage={true}/>
                    }
                </Modal>
            </div>
        )
    }

    renderPhoneNumber(isMobile) {
        return (
            <div className={`profile-general-info ${isMobile ? 'profile-general-info-mobile' : ''}`}>
                <Icon type="phone" /> <a href={`tel:${this.props.member.phoneNumber}`}>{this.props.member.phoneNumber}</a> {this.props.member.verifyPhone && (<span><Icon type="check-circle" style={{ fontSize: '16px', color: '#08c' }} /></span>)}
            </div>
        )
    }

    renderIsDriver(isMobile) {
        return (
            <div className={`profile-general-info ${isMobile ? 'profile-general-info-mobile' : ''}`}>
                {this.props.member.isDriver ? <Icon type="car" /> : <Icon type="user" />}
                <span>
                    {this.props.member.isDriver && (<span> Tài xế</span>)} {!this.props.member.isDriver && (<span> Hành khách</span>)}
                </span>
            </div>
        )
    }

    renderMobile() {
        return (
            <div>
                {this.renderBanner(true)}
                <div className="profile-info-container profile-info-container-mobile clearfix">
                    {this.renderAvatar(true)}
                    {this.renderFullName(true)}
                    {this.renderGender()}
                    {this.renderPhoneNumber(true)}
                    {this.renderIsDriver(true)}
                    {this.renderButton(true)}
                    {this.renderDescription(true)}
                </div>

                {this.props.member.isDriver && <div className="profile-info-container profile-info-container-mobile clearfix">
                    <div className="pull-left skillset-header">
                        <h4 className="komu-a">
                            Thông tin xe
                        </h4>
                    </div>
                    <div className="pull-right skillset-content">
                        <Row>
                            <Col span={24}>
                                {this.renderSocialMedia(true)}
                            </Col>
                        </Row>
                    </div>
                </div>}

                <Row>
                    <Col span={22} offset={1}>
                        <Comments type="user" reduxType="member" canPost={true} model={this.props.member}
                            headlines={true} returnUrl={`/member/${this.props.member._id}`}
                            header={I18N.get('comments.posts')}
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    renderSkillsets(isMobile) {
        return (
            <div className={`profile-skillset-info ${isMobile ? 'profile-skillset-info-mobile' : ''}`}>
                {_.map(this.props.member.profile.skillset || [], (skillset) =>
                    <Tag color="blue" key={skillset}>
                        {I18N.get(`user.skillset.${skillset}`)}
                    </Tag>
                )}
            </div>
        )
    }

    renderDesktop() {
        return (
            <div>
                {this.renderBanner()}

                <div className="profile-info-container clearfix">
                    <div className="profile-left pull-left">
                        {this.renderAvatar()}
                    </div>
                    <div className="profile-right pull-left">
                        {this.renderFullName()}
                        {this.renderButton()}
                        <Row>
                            <Col span={24} className="profile-right-col">
                                {this.renderGender()}
                            </Col>
                            <Col span={24} className="profile-right-col">
                                {this.renderPhoneNumber()}
                            </Col>
                            <Col span={24} className="profile-right-col">
                                {this.renderIsDriver()}
                            </Col>
                        </Row>
                    </div>
                    <div className="clearfix"/>
                    {this.renderDescription()}
                </div>

                {this.props.member.isDriver && <div className="profile-info-container clearfix">
                    <div className="pull-left skillset-header">
                        <h4 className="komu-a">
                            Thông tin xe
                        </h4>
                    </div>
                    <div className="pull-right skillset-content">
                        <Row>
                            <Col span={24}>
                                {this.renderSocialMedia()}
                            </Col>
                        </Row>
                    </div>
                </div>}

                <Row>
                    <Col span={24} className="gridCol">
                        <Comments type="user" reduxType="member" canPost={true} model={this.props.member}
                            headlines={true} returnUrl={`/member/${this.props.member._id}`}
                            header={I18N.get('comments.posts')}
                        />
                    </Col>
                </Row>
            </div>
        )
    }

    renderBanner(isMobile) {
        return (
            <div className={`profile-banner ${isMobile ? 'profile-banner-mobile' : ''}`}>
                <span style={{ backgroundImage: this.getBannerWithFallback(this.props.member.profile.banner) }}></span>
            </div>
        )
    }

    renderAvatar(isMobile) {
        return (
            <div className={`profile-avatar-container ${isMobile ? 'profile-avatar-container-mobile' : ''}`}>
                <div className="profile-avatar">
                    <img src={this.getAvatarWithFallback(this.props.member.profile.avatar)} />
                </div>
            </div>
        )
    }

    renderFullName(isMobile) {
        return (
            <h1 className={`komu-a profile-general-title ${isMobile ? 'profile-general-title-mobile' : ''}`}>
                {/* {this.props.member.profile.firstName}&nbsp; */}
                {/* {this.props.member.profile.lastName} */}
                {this.props.username}
            </h1>
        )
    }

    renderButton(isMobile) {
        return (
            <div className={`profile-button ${isMobile ? 'profile-button-mobile' : ''}`}>
                {/*{this.renderSendMessage()}*/}
                {/*{this.renderFollow()}*/}
            </div>
        )
    }

    renderSendMessage() {
        if (this.props.member._id === this.props.currentUserId) {
            return
        }

        return (
            <a onClick={this.linkProfilePopup.bind(this)}>
                <Icon type="message"/>
            </a>
        )
    }

    renderFollow() {
        if (this.props.member._id === this.props.currentUserId) {
            return
        }

        const isFollowing = this.isUserSubscribed()
        const clickHandler = isFollowing ? this.unfollowUser : this.followUser

        return (
            <a onClick={clickHandler.bind(this)}>
                {this.props.subscribing
                    ? <Icon type="loading"/>
                    : isFollowing
                        ? <Icon type="star" title="Hủy theo dõi"/>
                        : <Icon type="star-o" title="Theo dõi"/>
                }
            </a>
        )
    }

    renderLocation(isMobile) {
        return (
            <div className={`profile-general-info ${isMobile ? 'profile-general-info-mobile' : ''}`}>
                <Icon type="pushpin"/>
                <span>
                    {this.getCountryName(this.props.member.profile.country)}
                </span>
            </div>
        )
    }

    renderGender(isMobile) {
        return (
            <div className={`profile-general-info ${isMobile ? 'profile-general-info-mobile' : ''}`}>
                {(_.capitalize(this.props.member.profile.gender) === 'Male') && <span><Icon type="man" /> Nam</span>}
                    {(_.capitalize(this.props.member.profile.gender) === 'Female') && <span><Icon type="woman" /> Nữ</span>}
            </div>
        )
    }

    renderSkillsets(isMobile) {
        return (
            <div className="skillset-container">
                {_.map(this.props.member.profile.skillset || [], (skillset) =>
                    <div key={skillset}>
                        + {I18N.get(`user.skillset.${skillset}`)}
                    </div>
                )}
            </div>
        )
    }

    renderProfession(isMobile) {
        return (
            <div className="profession-container">
                {this.props.member.profile.profession &&
                    <div>
                        {I18N.get(`profile.profession.${this.props.member.profile.profession}`)}
                    </div>
                }
                {!_.isEmpty(this.props.member.profile.portfolio) &&
                    <div className="portfolio-container">
                        <a href={this.props.member.profile.portfolio} target="_blank" className="link-container">
                            <Icon type="link"/>
                        </a>
                        {I18N.get('profile.portfolio')}
                    </div>
                }
            </div>
        )
    }

    getBannerWithFallback(banner) {
        return _.isEmpty(banner)
            ? `url('/assets/images/profile-banner.png')`
            : `url(${banner})`
    }

    getAvatarWithFallback(avatar) {
        return _.isEmpty(avatar)
            ? USER_AVATAR_DEFAULT
            : avatar
    }

    renderLocalTime(isMobile) {
        const now = moment(Date.now())
        const user = this.props.member
        const localTime = user.profile.timezone
            ? now.tz(user.profile.timezone).format('LT z')
            : 'Unknown'

        return (
            <div className={`profile-general-info ${isMobile ? 'profile-general-info-mobile' : ''}`}>
                <Icon type="clock-circle"/>
                <span>
                    {localTime}
                </span>
            </div>
        )
    }

    renderSocialMedia(isMobile) {
        const { car } = this.props.member

        return (
            <div className={`profile-social ${isMobile ? 'profile-social-mobile' : ''}`}>
                <p>Tên xe: {car.carName}</p>
                <p>Biển số: {car.carId}</p>
                <p>Số ghế: {car.carSeat}</p>
                <p><Icon type="environment" style={{ fontSize: '16px', color: '#08c' }} /> Khu vực hoạt động: {car.carArea}</p>
                <p>
                    {car.carImages[0] && <img className="car-image" src={car.carImages[0].url}/>}&nbsp;
                    {car.carImages[1] && <img className="car-image" src={car.carImages[1].url}/>}&nbsp;
                    {car.carImages[2] && <img className="car-image" src={car.carImages[2].url}/>}&nbsp;
                </p>
            </div>
        )
    }

    renderDescription(isMobile) {
        const bio = _.get(this.props, 'member.profile.bio') || ''
        const content = linkifyStr(bio, LINKIFY_OPTION)
        return (
            <div>
                {
                    this.props.member.profile.bio &&
                    <div className={`profile-description ${isMobile ? 'profile-description-mobile' : ''}`} dangerouslySetInnerHTML={{__html: content}}></div>
                }
            </div>
        )
    }

    renderContactForm() {
        return <Row>
            <Col span={24}>
                {!this.props.is_login ? <div>
                    {I18N.get('profile.detail.requiredlogin')}
                </div> : <UserContactForm recipient={this.props.member}/>
                }
            </Col>
        </Row>
    }

    renderProjectsTasks() {
        const teams = _.map(this.props.teams, (team) => {
            return {
                _id: team._id,
                type: 'Team',
                name: team.name,
                date: team.updatedAt
            }
        })
        const circles = _.map(this.props.member.circles, (circle) => {
            return {
                _id: circle._id,
                type: 'Circle',
                name: circle.name,
                date: circle.updatedAt
            }
        })
        const projects = _.map(this.props.tasks, (task) => {
            return {
                _id: task._id,
                type: _.capitalize(task.type),
                name: task.name,
                date: task.updatedAt
            }
        })
        const data = _.concat(teams, circles, projects)
        const columns = [{
            title: I18N.get('profile.detail.columns.type'),
            key: 'type',
            width: 150,
            render: entry => {
                return (
                    <div key={entry._id}>
                        {entry.type}
                    </div>
                )
            }
        }, {
            title: I18N.get('profile.detail.columns.name'),
            key: 'name',
            width: 350,
            render: entry => {
                return (
                    <div key={entry._id}>
                        {entry.name}
                    </div>
                )
            }
        }, {
            title: I18N.get('profile.detail.columns.date'),
            key: 'date',
            width: 200,
            render: entry => {
                return (
                    <div key={entry._id}>
                        {moment(entry.date).format('MM/DD/YYYY')}
                    </div>
                )
            }
        }, {
            title: '',
            key: 'view',
            width: 100,
            render: entry => {
                return (
                    <Button key={entry._id} className="cr-btn" onClick={() => {
                        if (entry.type === 'Team') {
                            this.linkTeamDetail(entry._id)
                        } else if (entry.type === 'Circle') {
                            this.linkCircleDetail(entry._id)
                        } else if (entry.type === 'CR100') {
                            this.linkCR100Detail((entry._id))
                        } else {
                            this.linkProjectDetail((entry._id))
                        }
                    }}>
                        {I18N.get('profile.view')}
                    </Button>
                )
            }
        }]
        return (
            <div className="projects-tasks">
                <div className="pt-header">
                    <h3 className="with-gizmo">{I18N.get('profile.projectsTasks')}</h3>
                </div>
                <div className="pt-list">
                    <Table
                        dataSource={data}
                        columns={columns}
                        loading={this.props.loadingList}
                        rowKey="_id"
                        pagination={false}>
                    </Table>
                </div>
            </div>
        )
    }

    getCountryName(countryCode) {
        return config.data.mappingCountryCodeToName[countryCode]
    }

    isUserSubscribed() {
        const curDetail = this.props.member
        const subscribers = curDetail.subscribers || []
        return !!_.find(subscribers, (subscriber) => {
            return subscriber.user && subscriber.user._id === this.props.currentUserId
        })
    }

    followUser() {
        this.props.subscribe('user', this.props.member._id)
    }

    unfollowUser() {
        this.props.unsubscribe('user', this.props.member._id)
    }

    linkTeamDetail(teamId) {
        this.props.history.push(`/journey-driver/${teamId}`)
    }

    linkCircleDetail(circleId) {
        this.props.history.push(`/circle-detail/${circleId}`)
    }

    linkCR100Detail(taskId) {
        this.props.history.push(`/project-detail/${taskId}`)
    }

    linkProjectDetail(taskId) {
        this.props.history.push(`/journey-passenger/${taskId}`)
    }

    linkProfilePopup() {
        this.setState({
            showUserInfo: this.props.member
        })
    }

    handleCancelProfilePopup() {
        this.setState({
            showUserInfo: null
        })
    }
}
