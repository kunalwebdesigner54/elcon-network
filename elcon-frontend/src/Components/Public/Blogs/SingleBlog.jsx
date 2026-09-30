import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBlogById } from '../../../api/blogService';
import './SingleBlog.css';

export default function SingleBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogById(id)
      .then((res) => {
        if (res.success && res.item) {
          setBlog(res.item);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="single-blog-container loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="single-blog-container">
        <h2>Blog not found</h2>
      </div>
    );
  }

  return (
    <div className="single-blog-page">
      {/* Dynamic Header */}
      <div className="blog-page-header">
        <div className="public-container text-center">
          <h1>{blog.title}</h1>
          <p className="blog-publish-date">Published on: {blog.publishDate}</p>
        </div>
      </div>

      <div className="public-container">
        <div className="blog-content-wrapper">
          {blog.images && blog.images.length > 0 && (
            <div className="blog-hero-image">
              <img src={blog.images[0]} alt={blog.title} />
            </div>
          )}

          <div className="blog-main-content">
            {/* If content is saved as HTML, use dangerouslySetInnerHTML, otherwise render plain text. */}
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: blog.content || blog.description }} />
          </div>

          {blog.images && blog.images.length > 1 && (
            <div className="blog-extra-images">
              <h3>More Images</h3>
              <div className="blog-gallery">
                {blog.images.slice(1).map((img, idx) => (
                  <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="gallery-img" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
