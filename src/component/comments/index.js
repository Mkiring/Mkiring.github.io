/**
 * Created by axetroy on 17-4-6.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { distanceInWordsToNow } from "date-fns";
import chinese from "date-fns/locale/zh_cn";

import github from "../../lib/github";

class Comments extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    owner: PropTypes.string,
    repo: PropTypes.string,
    number: PropTypes.number,
    gistId: PropTypes.string
  };
  state = {
    comments: []
  };

  /**
   * 初始化
   *
   * @memberof Comments
   */
  componentDidMount() {
    switch (this.props.type) {
      case "issues":
        const { owner, repo, number } = this.props;
        if (typeof number === "number") {
          this.getIssuesComments(owner, repo, number);
        }
        break;
      case "gist":
        const { gistId } = this.props;
        if (typeof gistId === "string") {
          this.getGistComments(gistId);
        }
        break;
      default:
    }
  }

  /**
   * 更新组件
   * @param {any} nextProps
   * @memberof Comments
   */
  componentWillReceiveProps(nextProps) {
    switch (nextProps.type) {
      case "issues":
        if (
          nextProps.number !== this.props.number &&
          typeof nextProps.number === "number"
        ) {
          this.getIssuesComments(
            nextProps.owner,
            nextProps.repo,
            nextProps.number
          );
        }
        break;
      case "gist":
        if (
          nextProps.gistId !== this.props.gistId &&
          typeof nextProps.gistId === "string"
        ) {
          this.getGistComments(nextProps.gistId);
        }
        break;
      default:
    }
  }

  async getIssuesComments(owner, repo, number) {
    let comments = [];
    try {
      const { data } = await github.issues.listComments({
        owner,
        repo,
        issue_number: number,
        headers: {
          Accept: "application/vnd.github.v3.html"
        }
      });
      this.setState({ comments: data });
    } catch (err) {
      console.error(err);
    }
    return comments;
  }

  async getGistComments(gist_id) {
    let comments = [];
    try {
      const { data } = await github.gists.listComments({
        gist_id,
        headers: {
          Accept: "application/vnd.github.v3.html"
        }
      });
      comments = comments.concat(data || []);

      this.setState({ comments });
    } catch (err) {
      console.error(err);
    }
    return comments;
  }

  render() {
    const { type, owner, repo, number, gistId } = this.props;
    return (
      <div>
        <h3>
          大牛们的评论:
          {/* eslint-disable-next-line */}
          <a
            rel="noopener noreferrer"
            target="_blank"
            href={
              type === "issues"
                ? `https://github.com/${owner}/${repo}/issues/${number}#new_comment_field`
                : type === "gist"
                ? `https://gist.github.com/${gistId}#new_comment_field`
                : // eslint-disable-next-line
                  "javascript:void 0"
            }
            style={{
              float: "right"
            }}
          >
            朕有话说
          </a>
        </h3>

        {this.state.comments.length ? (
          this.state.comments.map(comment => {
            return (
              <div
                key={comment.id}
                style={{
                  border: "0.1rem solid #e2e2e2",
                  borderRadius: "0.5rem",
                  margin: "1rem 0"
                }}
              >
                <div
                  className="comment-header"
                  style={{
                    overflow: "hidden"
                  }}
                >
                  <img
                    style={{
                      width: "3.2rem",
                      verticalAlign: "middle",
                      borderRadius: "50%"
                    }}
                    src={comment.user.avatar_url}
                    alt=""
                  />
                  &nbsp;&nbsp;
                  <strong
                    style={{
                      color: "#586069"
                    }}
                  >
                    {/* eslint-disable-next-line */}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://github.com/${comment.user.login}`}
                    >
                      {comment.user.login}
                    </a>
                  </strong>
                  &nbsp;&nbsp;
                  <span>
                    {" "}
                    {`评论于 ${distanceInWordsToNow(comment.created_at, {
                      locale: chinese
                    })}前`}
                    {comment.created_at !== comment.updated_at
                      ? `&nbsp;&nbsp;更新于 ${distanceInWordsToNow(
                          comment.updated_at,
                          {
                            locale: chinese
                          }
                        )}前`
                      : ""}
                  </span>
                </div>
                <div
                  className="comment-body"
                  style={{
                    padding: "1.2rem"
                  }}
                >
                  <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{
                      __html: comment.body_html
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div>
            <p>还没有人评论哦，赶紧抢沙发!</p>
          </div>
        )}
      </div>
    );
  }
}
export default Comments;
